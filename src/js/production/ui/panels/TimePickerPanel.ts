import { MathUtils } from "@jocabola/math";
import { isMobile } from "@jocabola/utils";
import gsap from "gsap";
import { Vector2 } from "three";
import { solarClock } from "../../../common/core/CoreApp";
import { formatDate } from "../../utils/Dates";
import { inputInterface, inputs } from "../inputs/InputsManager";
import { Panel } from "./Panel";

enum STATE {
	HIDDEN,
	ACTIVE,
	EDIT
}

export class TimePickerPanel extends Panel {
	input: inputInterface;

	icon:HTMLElement;

	state:STATE = 0;

	bb:DOMRect;

	dragging:boolean = false;
	downPosition: Vector2 = new Vector2();
	mousePosition: Vector2 = new Vector2();

	reset: HTMLButtonElement;
	edit: HTMLButtonElement;
	pause: HTMLButtonElement;

	subPanel: HTMLElement;
	
	create(){
		this.input = inputs.find(x => x.name === 'time-picker-range');
		this.icon = this.dom.querySelector('.time-picker-icon');
		this.reposition();

		const buttonsZone = this.dom.querySelector('.time-picker-details');
		this.reset = buttonsZone.querySelector('[data-timer="reset"]');
		this.edit = buttonsZone.querySelector('[data-timer="edit"]');
		this.pause = buttonsZone.querySelector('[data-timer="pause"]');

		this.subPanel = this.dom.querySelector('.sub-panel');
	}

	reposition(){
		this.bb = this.dom.getBoundingClientRect();
		this.icon.style.transform = `translateY(-${this.bb.height}px)`;
	}

	closePanel(): void {
		this.state = 0;
		this.togglePanel();
	}

	togglePanel(): void {

		this.active = this.state > 0;

		if(this.active) this.dom.classList.add('active');
		else this.dom.classList.remove('active');

		if(this.state === 2) this.subPanel.classList.add('active');
		else this.subPanel.classList.remove('active');


		// if(this.state === 1) this.animationPlay();
		// if(this.state === 0) this.animationReset();
		// if(this.state !== 2) this.dateInputReset();
		
	}

	onResize(): void {
		this.closePanel();
		this.reposition();
	}

	addEventListeners(): void {

		const buttons = document.querySelectorAll(`[data-panel-button="${this.id}"]`);
		if(buttons.length === 0) return;		

		for(const button of buttons){
			button.addEventListener('click', () => { 												
				this.closePanel();
			})
		}


		this.reset.addEventListener('click', () => {	
			solarClock.setDate();
			this.input.input.dom.value = '0';
		})

		this.pause.addEventListener('click', () => {	
			this.input.input.dom.value = '0';
		})

		this.edit.addEventListener('click', () => {
			this.state = 2;
			this.togglePanel();
		})

		this.icon.addEventListener('mousedown', (e) => {						

			if(this.state === 0){
				this.state = 1;
				this.togglePanel();
			}

			if(this.state === 1) {
				this.dragging = true;
				this.downPosition.set(e.pageX, e.pageY);
			}
		})

		window.addEventListener('mousemove', (e) => {
			if(!this.dragging) return;
			this.mousePosition.set(e.pageX, e.pageY)
		})

		window.addEventListener('mouseup', () => {
			this.dragging = false;
		})
		
	}

	update(){
		if(!this.dragging) return;

		// const position = this.mousePosition.x - this.downPosition.x + this.bb.left;
		// const w = this.bb.width;
		// const x = MathUtils.clamp(MathUtils.map(position, -w, w, -100, 100), -45, 45);
		
		// this.icon.style.transform = `translateX(${x}%)`;
		
		
		
	}
}