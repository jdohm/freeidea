/**
 * @module og/IdeaEntity
 */

//--- TODO: replace Idea with ShowIdea
//          get Idea to display

import { Entity } from './entity/Entity.js';
import { ShowIdea } from './ShowIdea.js';
import { Idea } from './Idea.js';

class IdeaEntity extends Entity {

    showIdea(gplanet) {
        let myIdea = new ShowIdea({
            planet: gplanet,
            offset: [0, -235],
            visibility: false,
            _id: this.properties.name
        });
        let groundPos = gplanet.getCartesianFromMouseTerrain();
        myIdea.setCartesian3v(groundPos);

	      myIdea.setContent(``);
        console.log("got here");
        myIdea.setVisibility(true);
    }
}

export { IdeaEntity };
