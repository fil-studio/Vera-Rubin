import { Inputs } from "../ui/inputs/Inputs";
import { Panels } from "../ui/panels/Panels";

export class Page {
	dom:HTMLElement = null;
	active:boolean = false;
	loaded:boolean = false;

	panels:Panels;

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
		resolve();	
	}
	
	disable () {
		this.active = false;
	}

	load(resolve){				
		this.loaded = true;	
		this.onLoaded();
		this.addEventListeners();

		
		new Inputs(this.dom);
		this.panels = new Panels(this.dom);


		this.enable(resolve);
	}

	onLoaded(){

	}

	addEventListeners(){

	}

	onResize(){
		if(!this.active) return;
		console.log('Page Resize');
	}

	update(){		
		if(!this.active || !this.loaded) return;				
		if(this.panels) this.panels.update();
	}
}