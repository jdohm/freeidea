'use strict';

import { Events } from './Events.js';
import { Vec3 } from './math/Vec3.js';
import { getHTML, parseHTML, createLonLat } from './utils/shared.js';

const TEMPLATE =
    `<div class="og-idea {className}">
      <div class="og-idea-content-wrapper">
        <div class="og-idea-content"></div>
        <form method="POST" action="submitShowIdea" class="og-idea-contentInt" enctype="application/x-www-form-urlencoded"  target="_blank">
        <div id="og-popup-title"><\div>
		<textarea id="nameText" style="overflow:auto;resize:none" rows="1" cols="60" name="nameText" placeholder="Using Peanuts to end world hunger"></textarea>
        <H3>Please describe your ShowIdea:<\H3>
		<textarea id="ideaText" style="overflow:auto;resize:none" rows="5" cols="60" name="ideaText" placeholder="Enter text"></textarea>
	    <p>Add topics</p>
		<textarea id="categoriesText" style="overflow:auto;resize:none" rows="1" cols="60" name="categoriesText" placeholder="social, environment, it, ..."></textarea>
	    <p>Needed skills</p>
		<textarea id="skillsText" style="overflow:auto;resize:none" rows="1" cols="60" name="skillsText" placeholder="programming, management, UI-Design, knitting, ..."></textarea>
        </br>
		<button style="margin-left: 4px" class="up-btn" type="button">Vote Up!</button>
		<button style="margin-left: 4px" class="down-btn" type="button">Vote Down :(</button>
		</form>
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

        this._id = ShowIdea._staticCounter++;

        this.events = new Events(["open", "close"]);

        this._template = getHTML(TEMPLATE, { className: options.className });

        this.el = null;

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
        this._titleEl = this.el.querySelector(".og-popup-title");
        this._contentEl = this.el.querySelector(".og-idea-content");
        //TODO: set this._titleEl.innerHTML = Titel von serverabfrage 
        //TODO: set this._contentEl.innerHTML = description von serverabfrage 
        this.setOffset(this._offset[0], this._offset[1]);
        this.setContent(this._content);
        this.setLonLat(this._lonLat);
        this.setVisibility(this._visibility);
        this.el.querySelector(".og-popup-close").addEventListener("click", (e) => {
            this.hide();
        });
        this.el.querySelector(".down-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+this.properties.name+"&upvote=0");  
            this.hide();
        });
        this.el.querySelector(".up-btn").addEventListener("click", (e) => {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", "submitVote", true);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("IdeaID="+this.properties.name+"&upvote=1");  
            this.hide();
        });
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


}

export { ShowIdea };
