import { MathUtils } from "@jocabola/math";
import { isMobile } from "@jocabola/utils";
import gsap from "gsap";
import { solarClock } from "../../../common/core/CoreApp";
import { CLOCK_SETTINGS } from "../../../common/core/Globals";
import { formatDate } from "../../utils/Dates";
import { Panel } from "./Panel";
import { panels } from "./PanelsManager";
import { TimePickerSubPanel } from "./TimePickerSubPanel";

export enum STATE {
	HIDDEN,
	HIDDEN_EDITED,
	ACTIVE,
	EDIT,
}


export class TimePickerPanel extends Panel {
	timer: HTMLElement;
	icon: HTMLElement;
	fakeRange: HTMLElement;

	state: STATE = 0;

	resetButton: HTMLButtonElement;
	editButton: HTMLButtonElement;
	pauseButton: HTMLButtonElement;

	subPanel: TimePickerSubPanel;

	range: HTMLInputElement;
	value: number = 0;
	holding: boolean = false;

	date: Date; 
	domDate: HTMLElement;

	arrowsTl: GSAPTimeline;

	dragging: boolean = false;
	draggingOriginalX: number = 0;
	draggingOriginalValue: number = 0;
	draggingRangeW: number = 0;

	create(){
		this.timer = document.querySelector('.timer');
		this.icon = this.timer.querySelector('.timer-icon');
		this.fakeRange = this.timer.querySelector('.fake-range');

		const buttonsZone = this.dom.querySelector('.time-picker-details');
		this.resetButton = buttonsZone.querySelector('[data-timer="reset"]');
		this.editButton = buttonsZone.querySelector('[data-timer="edit"]');
		this.pauseButton = buttonsZone.querySelector('[data-timer="pause"]');

		this.subPanel = panels.find(x => x.id === 'time-picker-subpanel') as TimePickerSubPanel;
		
		this.range = this.timer.querySelector('input');
		this.value = this.range.valueAsNumber;

		this.date = new Date();
		this.domDate = this.dom.querySelector('.time-picker-details p span');

		this.arrowsTl = createArrowsTl();
	}

	leave(){
		this.reset();
		this.state = STATE.HIDDEN;
		this.changeState();
	}

	onMousedown(e) {
		this.dragging = true;

		const r = this.fakeRange.getBoundingClientRect();
		this.draggingRangeW = r.width;

		this.draggingOriginalX = e.clientX;

		this.draggingOriginalValue = MathUtils.map(this.value, -1, 1, 0, this.draggingRangeW);

		window.addEventListener('mouseup', () => {
			this.dragging = false;
			this.draggingOriginalX = 0;
		}, { once: true })
	
	}

	onMousemove(e) {
		if(!this.dragging) return;

		const movementDistance = this.draggingOriginalValue + (e.clientX - this.draggingOriginalX);		
		const newValue = MathUtils.clamp(MathUtils.map(movementDistance, 0, this.draggingRangeW, -1, 1), -1, 1);
		
		this.timer.style.setProperty('--thumb-x', `${MathUtils.map(newValue, -1, 1, 0, 1)}`);
		this.range.valueAsNumber = newValue;
		this.value = newValue;		
		
	}

	addEventListeners(): void {
		
		this.icon.addEventListener('mousedown', (e) => {
			this.onMousedown(e);
			if(this.state === STATE.ACTIVE) return;
			this.state = STATE.ACTIVE;
			this.changeState();
			
		})

		window.addEventListener('mousemove', (e) => {
			this.onMousemove(e);
		})

		this.resetButton.addEventListener('click', () => {	
			this.reset()
		})

		this.pauseButton.addEventListener('click', () => {	
			this.pause();
		})

		this.editButton.addEventListener('click', () => {
			this.state = STATE.EDIT;
			this.toggleSubPanel();
		})


		const buttons = document.querySelectorAll(`[data-panel-button="${this.id}"]`);
		if(buttons.length === 0) return;		

		for(const button of buttons){
			button.addEventListener('click', () => { 							
				if(this.state === STATE.ACTIVE) {					
					this.state = this.value === 0 ? STATE.HIDDEN : STATE.HIDDEN_EDITED;
				} else {
					this.state = STATE.ACTIVE;
				}
				this.changeState();
			})
		}
		
	}

	reset(){		
		solarClock.setDate();
		this.subPanel.dateInputReset();
		this.pause();
	}

	pause(){
		this.range.valueAsNumber = 0;
		this.timer.style.setProperty('--thumb-x', `0.5`);
		this.value = 0;
		CLOCK_SETTINGS.speed = this.value * CLOCK_SETTINGS.maxSpeed;
	}

	toggleSubPanel(){
		if(this.state === STATE.EDIT) {
			this.subPanel.togglePanel();
			this.state = STATE.HIDDEN;
			this.changeState();
		} else this.subPanel.closePanel(true);
	}

	changeState(){
		this.timer.setAttribute('state', `${this.state}`);

		if(this.state === STATE.HIDDEN){
			this.arrowsTlReverse();
			setTimeout(() => {
				this.timer.classList.remove('on-top');
			}, 500);
			this.closePanel();
		}

		if(this.state === STATE.HIDDEN_EDITED){
			this.arrowsTlReverse();
			setTimeout(() => {
				this.timer.classList.remove('on-top');
			}, 500);
			this.closePanel();
		}

		if(this.state === STATE.ACTIVE){
			this.timer.classList.add('on-top');			
			this.arrowsTlPlay();
			this.togglePanel();
		}
	}

	arrowsTlPlay(){
		this.arrowsTl.timeScale(1.2);
		this.arrowsTl.play();
	}
	arrowsTlReverse(){
		this.arrowsTl.timeScale(5);
		this.arrowsTl.reverse();
	}

	update(): void {
		if(this.state === STATE.HIDDEN) return;
		
		const date = formatDate(solarClock.currentDate);
		this.domDate.innerText = date;		
		
		CLOCK_SETTINGS.speed = this.value * CLOCK_SETTINGS.maxSpeed;
	}
}

const createArrowsTl = ():GSAPTimeline => {
	const tl = gsap.timeline({ paused: true });

	tl.addLabel('start', 0.2)

	const wrapper = document.querySelector('.timer-chevs');

	// Set all paths to alpha 0
	const paths = wrapper.querySelectorAll('path');
	for(const path of paths) {
		gsap.set(path, { autoAlpha: 0 })
	}

	const past = wrapper.querySelectorAll('[class^="past"]');
	const future = wrapper.querySelectorAll('[class^="future"]');

	for(let i = 0; i<=2; i++){

		const ii = i + 1;

		const distance = isMobile() ? 40 : 58;
		const initialOffset = 20;
		const distanceBetweenChevrons = 7;

		gsap.set(past[i].querySelectorAll('path'), {
			x: (index, element) => {
				const offset = distanceBetweenChevrons * index;
				return (distance * ii) + offset - initialOffset;
			},
		})
		gsap.set(future[i].querySelectorAll('path'), {
			x: (index, element) => {
				const offset = distanceBetweenChevrons * index;
				return -(distance * ii) - offset + initialOffset;
			},
		})

		const pastTween = gsap.to(past[i].querySelectorAll('path'), {
			x: (index, element) => {
				const offset = distanceBetweenChevrons * index;
				return (distance * ii) + offset
			},
			autoAlpha: 1,
			ease: 'expo.out',
			duration: 1.5,
			stagger: 0.1
		})
		const futureTween = gsap.to(future[i].querySelectorAll('path'), {
			x: (index, element) => {
				const offset = distanceBetweenChevrons * index;
				return -(distance * ii) - offset
			},
			autoAlpha: 1,
			ease: 'expo.out',
			duration: 1.5,
			stagger: 0.1
		})

		const start = 0.2 * ii;
		tl.add(pastTween, `start+=${start}`)
		tl.add(futureTween, `start+=${start}`)

	}


	return tl;
}


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