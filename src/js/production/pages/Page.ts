import { solarClock } from "../../common/core/CoreApp";
import { shareInit } from "../partials/Share";
import { addInputs, Inputs } from "../ui/inputs/InputsManager";
import { Panels } from "../ui/panels/Panels";
import { addPanels, broadcastPanelsClose } from "../ui/panels/PanelsManager";

export class Page {
	dom:HTMLElement = null;
	active:boolean = false;
	loaded:boolean = false;

	panels:Panels;
	inputs:Inputs;

	prepare() {		
		this.active = true;
		return new Promise(resolve => {		
			if(this.loaded){			
				this.enable(resolve);
			} else {
				this.load(resolve);
			}
		})
	}

	enable(resolve){
		this.dom.classList.remove('disabled');
		this.show();
		resolve();	
	}

	show(){
		
	}

	hide(){		
		broadcastPanelsClose();
		solarClock.pause();
	}
	
	disable () {
		this.dom.classList.add('disabled');
		this.active = false;
	}

	load(resolve){				
		this.loaded = true;	
		this.onLoaded();
		this.addEventListeners();

		shareInit(this.dom);

		addInputs(this.dom);
		addPanels(this.dom);

		this.enable(resolve);
	}

	onLoaded(){

	}

	addEventListeners(){

	}

	onResize(){
		if(!this.active || !this.loaded) return;
	}

	update(){		
		if(!this.active || !this.loaded) return;				
	}
}