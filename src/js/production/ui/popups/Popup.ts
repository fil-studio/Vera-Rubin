import { MathUtils } from "@jocabola/math";
import { Vector3 } from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { CameraManager } from "../../../common/core/CameraManager";
import { CAMERA_POSITION } from "../../../common/core/Globals";
import { css2D } from "./Css2D";
import { InteractiveObject } from "./Raycaster";
import { Popups, onHide, onShow } from "./PopupsManager";

export class Popup {
	dom: HTMLElement;
	container: CSS2DObject;

	containerElement: HTMLElement;
	ref: InteractiveObject;

	name: string;

	visible: boolean = false;
	active: boolean = false;

	sections:NodeListOf<HTMLElement>;

	tmp: Vector3 = new Vector3();

	constructor(dom){
		
		this.dom = dom;
		this.container = new CSS2DObject(this.dom);
		css2D.add(this.container);

		this.containerElement = this.container.element.querySelector('.item-scale-wrapper');
		
		this.name = this.dom.getAttribute('data-name');		

		this.sections = this.dom.querySelectorAll('section');

		this.onResize();
	}

	loaded(){
		this.visible = true;		
		this.dom.classList.add('visible');		
		this.addEventListeners();
	}


	onResize(){

		for(const section of this.sections){
			const contents = section.querySelectorAll('.content');
			for(const content of contents) {
				content.style.height = 'auto';
				const r = content.getBoundingClientRect();
				content.style.setProperty('--height', `${r.height + 20 }px`);
				content.style.height = '';
			}
			
		}

	}


	hide(){		
		if(!this.active) return;
		console.log('hide');

		this.active = false;
		this.ref.selected = false;
		onHide();
		this.dom.classList.remove('active');
		for(const section of this.sections) section.classList.remove('active');

	}

	show(){
		if(this.active) return;
		if(!this.visible) return;
		console.log('show');
		
		this.active = true;
		this.dom.classList.add('active');
		
		this.ref.selected = true;
		CameraManager.goToTarget(this.ref);
		onShow();

		this.sections[0].classList.add('active');

	}

	addEventListeners(){
		
		this.dom.querySelector('.close-item').addEventListener('click', (ev) => {			
			this.hide();		
		})

		this.dom.querySelector('.item-wrapper .cover').addEventListener('click', (ev) => {							
			this.show();
		})

		document.addEventListener('keydown', (e) => {			
			if(e.key != 'Escape') return;
			this.hide();
		})

		for(const section of this.sections){
			section.querySelector('.head').addEventListener('click', () => {				
				for(const section of this.sections) section.classList.remove('active');
				section.classList.add('active');
			})
		}

	}

	update(){		
		if(!this.visible) return;
		if(!!!this.ref) return;

		this.container.position.copy(this.ref.position);	
		
		const d = this.ref.position.distanceTo(CAMERA_POSITION);
		
		if(d > 80){
			this.container.element.style.opacity = 0;
			return;
		}
		const s = MathUtils.clamp( MathUtils.map(d, 5, 150, 1, 0.1), 0.1, 1);
		this.containerElement.style.transform = `scale3d(${s}, ${s}, 1)`;
		this.container.element.style.opacity = 1;


	}
}
