'use strict';

import { Events } from './Events.js';
import { Vec3 } from './math/Vec3.js';
import { getHTML, parseHTML, createLonLat } from './utils/shared.js';

const TEMPLATE =
    `<div class="og-idea {className}">
      <div class="og-idea-content-wrapper">
      <div class="og-popup-title"> </div>
      <div class="og-idea-showcontent"></div>
		<!-- button style="margin-left: 4px" class="up-btn" type="button">Vote Up!</button -->
		<!-- button style="margin-left: 4px" class="down-btn" type="button">Vote Down :(</button -->
    <img src="./media/up.svg" alt="Vote Up!" class="up-btn" style="width:200px;margin-left: 20px;margin-top: 6px;vertical-align: bottom;"> 
    <img src="./media/down.svg" class="down-btn" alt="Vote Down" style="width:200px;"> 
      </div>
      <div class="og-idea-tip-container">
        <div class="og-idea-tip"></div>
      </div>
      <div class="og-idea-toolbar">
        <div class="og-popup-btn og-popup-close">×</div>
      </div>
    </div>`;

class ShowIdea {
    constructor(options) {

        this._id = options._id;//ShowIdea._staticCounter++;

        this.events = new Events(["open", "close"]);

        this._template = getHTML(TEMPLATE, { className: options.className });

        this.el = null;

        this._title = options.title || "";

        this._content = options.content || null;

        this._contentEl = null;

        this._titleEl = null;

        this._tagsEl = null;

        this._skillsEl = null;


        this._planet = options.planet;

        this._offset = options.offset || [0, 0];

        this._lonLat = createLonLat(options.lonLat);

        this._cartPos = new Vec3();

        this._visibility = options.visibility || false;

        this.render();
    }

    static get _staticCounter() {
        if (!this.__counter__ && this.__counter__ !== 0) {
            this.__counter__ = 0;
        }
        return this.__counter__;
    }

    static set _staticCounter(n) {
        this.__counter__ = n;
    }

    _renderTemplate() {
        return parseHTML(this._template)[0];
    }

    _updatePosition() {
        this.setCartesian3v(this._cartPos);
    }

    setScreen(p) {
        if (this._planet) {
            this.el.style.transform = "translate(" + (p.x - this.clientWidth * 0.5) + "px, " + (p.y - this._planet.renderer.handler.canvas.height - this.clientHeight * 0.5) + "px)";
        }
    }

    get clientWidth() {
        return this.el.clientWidth;
    }

    get clientHeight() {
        return this.el.clientHeight;
    }

    setOffset(x = 0, y = 0) {
        this._offset[0] = x;
        this._offset[1] = y;
        if (this.el) {
            this.el.style.left = `${x}px`;
            this.el.style.bottom = `${y}px`;
        }
        return this;
    }

    render(params) {
        this.el = this._renderTemplate(params);
        this._contentEl = this.el.querySelector(".og-idea-showcontent");
        this._titleEl = this.el.querySelector(".og-popup-title");





        //TODO: set this._contentEl.innerHTML = description von serverabfrage 
        this.setOffset(this._offset[0], this._offset[1]);
        this.setContent(this._content);
        this.setTitle(this._title);
        this.setLonLat(this._lonLat);
        this.setVisibility(this._visibility);
        this.el.querySelector(".og-popup-close").addEventListener("click", (e) => {
            this.hide();
        });
        var nameID = this._id;
        this.el.querySelector(".down-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+nameID+"&upvote=0");  
            this.hide();
        });
        this.el.querySelector(".up-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+nameID+"&upvote=1");  
            this.hide();
        });


        /*-------------
          get Infos for Idea from server
        */

        var xhttp = new XMLHttpRequest();
        var self = this;
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var obj = JSON.parse(this.responseText);

                console.log('Asked ID: ' + obj.AskForIdea);
                console.log('Titel: ' + obj.TITLE);
                console.log('Description: ' + obj.DESCRIPTION);
                self.setTitle("<H2>" + obj.TITLE + "</H2>");
                self.setContent("<p>" + obj.DESCRIPTION + "</p>");
            }
        };
        xhttp.open("POST", "getIdea", true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("IdeaID="+this._id);

        /*-------------
          get Infos for Idea from server
        */
        return this;
    }

    setVisibility(visibility) {
        if (visibility) {
            this.show();
        } else {
            this.hide();
        }
        return this;
    }

    getContainer() {
        return this._contentEl;
    }

    getToolbarContainer() {
        return this.el.querySelector(".og-idea-toolbar");
    }

    show() {
        this._visibility = true;
        if (this._planet) {
            this._planet.events.on("draw", this._updatePosition, this);
            this._planet.renderer.div.appendChild(this.el);
            this.events.dispatch(this.events.open, this);
        }
        return this;
    }

    hide() {
        this._visibility = false;
        if (this.el.parentNode) {
            this._planet.events.off("draw", this._updatePosition);
            this.el.parentNode.removeChild(this.el);
            this.events.dispatch(this.events.close, this);
        }
        return this;
    }

    setCartesian3v(cart, height = 0) {

        this._cartPos = cart;

        if (this._planet) {
            let cam = this._planet.camera;
            let f = this._planet.ellipsoid._a + height,
                g = cam._lonLat.height;

            let look = cart.sub(cam.eye),
                v = Math.sqrt((f + g) * (f + g) - f * f);

            if (v > look.length() && cam.getForward().dot(look.normalize()) > 0.0) {
                this.el.style.display = "block";
                this.setScreen(cam.project(cart));
            } else {
                this.el.style.display = "none";
            }
        }
        return this;
    }

    setTitle(html) {
        this._title = html;
        this._titleEl.innerHTML = html;
        return this;
    }

    setLonLat(lonLat) {
        this._lonLat = lonLat;
        if (this._planet) {
            this.setCartesian3v(this._planet.ellipsoid.lonLatToCartesian(lonLat), lonLat.height);
        }
        return this;
    }

    setContent(content) {
        if (content) {
            this.clear();
            this._content = content;
            if (typeof content === 'string') {
                this._contentEl.innerHTML = content;
            } else {
                this._contentEl.appendChild(content);
            }
        }
        return this;
    }

    clear() {
        this._content = null;
        this._contentEl.innerHTML = "";
    }

    //setTitle(content) {
        //if (content) {
            //this.clearTitle();
            //this._title = content;
            //if (typeof content === 'string') {
                //this._titleEl.innerHTML = content;
            //} else {
                //this._titleEl.appendChild(content);
            //}
        //}
        //return this;
    //}

    //clearTitle() {
        //this._title = null;
        //this._titleEl.innerHTML = "";
    //}

}

export { ShowIdea };
