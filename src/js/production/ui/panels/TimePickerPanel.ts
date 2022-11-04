import { MathUtils } from "@jocabola/math";
import { isMobile } from "@jocabola/utils";
import gsap from "gsap";
import { solarClock } from "../../../common/core/CoreApp";
import { formatDate } from "../../utils/Dates";
import { Panel } from "./Panel";
import { panels } from "./PanelsManager";
import { TimePickerSubPanel } from "./TimePickerSubPanel";

export enum STATE {
	HIDDEN,
	ACTIVE,
	EDIT,
	HIDDEN_EDITED
}


export class TimePickerPanel extends Panel {
	timer: HTMLElement;
	icon: HTMLElement;

	state:STATE = 0;

	reset: HTMLButtonElement;
	edit: HTMLButtonElement;
	pause: HTMLButtonElement;

	subPanel: TimePickerSubPanel;

	range: HTMLInputElement;
	value: number = 0;
	holding: boolean = false;

	date: Date; 
	domDate: HTMLElement;

	create(){
		this.timer = document.querySelector('.timer');
		this.icon = this.timer.querySelector('.timer-icon');

		const buttonsZone = this.dom.querySelector('.time-picker-details');
		this.reset = buttonsZone.querySelector('[data-timer="reset"]');
		this.edit = buttonsZone.querySelector('[data-timer="edit"]');
		this.pause = buttonsZone.querySelector('[data-timer="pause"]');

		this.subPanel = panels.find(x => x.id === 'time-picker-subpanel') as TimePickerSubPanel;
		
		this.range = this.timer.querySelector('input');

		this.date = new Date();
		this.domDate = this.dom.querySelector('.time-picker-details p span');
	}

	addEventListeners(): void {
		
		this.icon.addEventListener('mousedown', (e) => {
			if(this.state === 0){
				this.state = STATE.ACTIVE;
				this.changeState();
				return;
			}
		})

		this.reset.addEventListener('click', () => {	
			solarClock.setDate();
			this.subPanel.dateInputReset();
			this.range.value = '0';
		})

		this.pause.addEventListener('click', () => {	
			this.state = STATE.ACTIVE;
			this.range.value = '0';
		})

		this.edit.addEventListener('click', () => {
			this.state = STATE.EDIT;
			this.toggleSubPanel();
		})


		super.addEventListeners();
		
	}

	toggleSubPanel(){
		if(this.state === STATE.EDIT) this.subPanel.togglePanel();
		else this.subPanel.closePanel(true);
	}

	togglePanel(): void {
		if(this.active) {
			this.state = STATE.HIDDEN;
			this.changeState();
		}

		super.togglePanel();

		// 		this.active = this.state > 0;
		// 		if(this.active) this.dom.classList.add('active');
		// 		else this.dom.classList.remove('active');

		// 		if(this.state === 2) this.subPanel.classList.add('active');
		// 		else this.subPanel.classList.remove('active');

		// 		if(this.state > 0) this.orbitButton.classList.add('hidden');
		// 		else this.orbitButton.classList.remove('hidden');

		// 		if(this.state === 1) this.animationPlay();
		// 		if(this.state === 0) this.animationReset();
		// 		if(this.state !== 2) this.dateInputReset();
	}

	changeState(){
		this.timer.setAttribute('state', `${this.state}`);
		if(this.state === STATE.HIDDEN){
			setTimeout(() => {
				this.timer.classList.remove('on-top');
			}, 500);
		}
		if(this.state === STATE.ACTIVE){
			this.timer.classList.add('on-top');
			this.togglePanel();
		}
	}

	update(): void {
		const date = formatDate(solarClock.currentDate);
		this.domDate.innerText = date;		
	}
}


// export class TimePickerPanel extends Panel {
// 	orbitButton: HTMLButtonElement;
// 	thumb: HTMLButtonElement;
// 	subPanel: HTMLElement;

// 	date: Date; 
// 	domDate: HTMLElement;

// 	reset: HTMLButtonElement;
// 	edit: HTMLButtonElement;
// 	pause: HTMLButtonElement;

// 	state: STATE = 0;

// 	range: HTMLInputElement;
// 	value: number = 0;
// 	holding: boolean = false;

// 	subPanelApply: HTMLButtonElement;
// 	subPanelCancel: HTMLButtonElement;
// 	subPanelInput: HTMLInputElement;

// 	tl: GSAPTimeline;
// 	tlPlayed: boolean = false;

// 	tlClock: GSAPTimeline;
	
// 	constructor(id){
// 		super(id);
// 		this.updateTimer();
// 	}

// 	create(): void {

// 		// Date 
// 		this.date = new Date();
// 		this.domDate = this.dom.querySelector('.time-picker-details p span');

// 		// DOM
// 		this.orbitButton = document.querySelector(`.time-picker`);
// 		this.thumb = this.dom.querySelector('.time-picker-icon');
// 		this.range = this.dom.querySelector('.time-picker-input input');

// 		this.createTl();
// 		this.createClockTl();
// 	}

// 	leave(){
// 		super.leave();

// 		this.range.value = '0';

// 	}

// 	createTl(){
// 		this.tl = gsap.timeline({
// 			paused: true,
// 		});

// 		this.tl.addLabel('start', 0.5)

// 		this.tl.timeScale(1.2);

// 		const wrapper = this.dom.querySelector('.time-picker-input svg');
	
// 		// Set all paths to alpha 0
// 		const paths = wrapper.querySelectorAll('path');
// 		for(const path of paths) {
// 			gsap.set(path, { autoAlpha: 0 })
// 		}

// 		// Range tween
// 		gsap.set(this.range, { scaleX: 0, transformOrigin: 'center' });
// 		this.tl.add(gsap.to(this.range, { scaleX: 1, duration: 2, ease: 'expo.out' }), 'start');

// 		// Create chevron tweens
// 		const past = wrapper.querySelectorAll('[class^="past"]');
// 		const future = wrapper.querySelectorAll('[class^="future"]');

// 		for(let i = 0; i<=2; i++){

// 			const ii = i + 1;

// 			const distance = isMobile() ? 40 : 60;
// 			const initialOffset = 20;
// 			const distanceBetweenChevrons = 7;

// 			gsap.set(past[i].querySelectorAll('path'), {
// 				x: (index, element) => {
// 					const offset = distanceBetweenChevrons * index;
// 					return (distance * ii) + offset - initialOffset;
// 				},
// 			})
// 			gsap.set(future[i].querySelectorAll('path'), {
// 				x: (index, element) => {
// 					const offset = distanceBetweenChevrons * index;
// 					return -(distance * ii) - offset + initialOffset;
// 				},
// 			})

// 			const pastTween = gsap.to(past[i].querySelectorAll('path'), {
// 				x: (index, element) => {
// 					const offset = distanceBetweenChevrons * index;
// 					return (distance * ii) + offset
// 				},
// 				autoAlpha: 1,
// 				ease: 'expo.out',
// 				duration: 1.5,
// 				stagger: 0.1
// 			})
// 			const futureTween = gsap.to(future[i].querySelectorAll('path'), {
// 				x: (index, element) => {
// 					const offset = distanceBetweenChevrons * index;
// 					return -(distance * ii) - offset
// 				},
// 				autoAlpha: 1,
// 				ease: 'expo.out',
// 				duration: 1.5,
// 				stagger: 0.1
// 			})

// 			const start = 0.2 * ii;
// 			this.tl.add(pastTween, `start+=${start}`)
// 			this.tl.add(futureTween, `start+=${start}`)

// 		}
		
// 	}

// 	createClockTl(){

// 		const busques = this.dom.querySelectorAll('.time-picker-icon-wrapper svg g path');
// 		this.tlClock = gsap.timeline({ paused: true });

// 		gsap.set(busques[0], { transformOrigin: '50% 100%', rotate: -800 });
// 		gsap.set(busques[1], { transformOrigin: '20% 20%', rotate: -200 });

// 		this.tlClock
// 			.to(busques[0],{ rotate: 800, ease: 'linear' }, 0)
// 			.to(busques[1],{ rotate: 200, ease: 'linear' }, 0)
	
// 	}

// 	animationPlay(){
// 		if(this.tlPlayed) return;
// 		this.tlPlayed = true;

// 		this.tl.pause();
// 		this.tl.progress(0);

// 		this.tl.play();

// 	}

// 	animationReset(){
// 		if(!this.tlPlayed) return;
// 		this.tlPlayed = false;

// 	}



// 	closePanel(): void {
// 		this.state = 0;
// 		this.togglePanel();
// 	}

// 	togglePanel(): void {

// 		this.active = this.state > 0;
// 		if(this.active) this.dom.classList.add('active');
// 		else this.dom.classList.remove('active');

// 		if(this.state === 2) this.subPanel.classList.add('active');
// 		else this.subPanel.classList.remove('active');

// 		if(this.state > 0) this.orbitButton.classList.add('hidden');
// 		else this.orbitButton.classList.remove('hidden');

// 		if(this.state === 1) this.animationPlay();
// 		if(this.state === 0) this.animationReset();
// 		if(this.state !== 2) this.dateInputReset();
		
// 	}

// 	addEventListeners(){

// 		const buttons = document.querySelectorAll(`[data-panel-button="${this.id}"]`);
// 		if(buttons.length === 0) return;

// 		for(const button of buttons){
// 			button.addEventListener('click', () => { 		
// 				if(this.active) this.state = 0;
// 				else this.state = 1;

// 				this.togglePanel();
// 			})
// 		}

// 		this.reset.addEventListener('click', () => {	
// 			solarClock.setDate();
// 			this.range.value = '0';
// 		})

// 		this.pause.addEventListener('click', () => {	
// 			this.range.value = '0';
// 		})

// 		this.edit.addEventListener('click', () => {
// 			this.state = 2;
// 			this.togglePanel();
// 		})

// 		this.subPanelApply.addEventListener('click', () => {
// 			this.updateTimer();
// 		})

// 		this.subPanelCancel.addEventListener('click', () => {
// 			this.state = 1;
// 			this.togglePanel();
// 		})

// 	}

// 	update(){

// 		if(!this.active) return;

// 		this.value = parseFloat(this.range.value);
		
// 		console.log(this.value);
		
// 		if(!this.holding){
// 			this.value = MathUtils.lerp(this.value, 0, 0.1);
// 			// this.range.value = this.value.toString();
// 		}
		
// 		this.thumb.style.transform = `translateX(${50 * this.value}%)`;

// 		// Update date
// 		const date = formatDate(solarClock.currentDate);
// 		this.domDate.innerText = date;		

// 		// Update clock animation
// 		this.tlClock.progress(MathUtils.map(this.value, -1, 1, 0, 1))
				
// 	}
// }