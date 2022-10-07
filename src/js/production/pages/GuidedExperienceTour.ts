import gsap from "gsap";
import { CameraManager } from "../../common/core/CameraManager";
import { CoreAppSingleton, solarClock } from "../../common/core/CoreApp";
import { SolarElement } from "../../common/solar/SolarElement";
import { Page } from "./Page";

interface slides {
	index: number,
	type: string,
	dom: HTMLElement,
	tlIn: GSAPTimeline,
	tlOut: GSAPTimeline,
	closeup: string
}

const D = .5;


export class GuidedExperienceTour extends Page {
	slides:Array<slides> = [];
	activeSlide: number = 0;
	changeInProgress: boolean = false;
	solarElement:SolarElement;

	onLoaded(){
		this.createSlides();

		for(const slide of this.slides){
			if(slide === this.slides[this.activeSlide]) continue;
			gsap.set(slide.dom, {
				xPercent: -20,
				autoAlpha: 0,
			})
		}
	}

	createSlides() {

		const slides = this.dom.querySelectorAll('[data-slide]');

		for(const slide of slides){			
			const closeup = slide.hasAttribute('data-closeup') ? slide.getAttribute('data-closeup') : null;

			const slideItem = {
				index: parseInt(slide.getAttribute('data-slide-index')),
				type: slide.getAttribute('data-slide'),
				active: false,
				dom: slide as HTMLElement,
				tlIn: this.tlIn(slide, slide.getAttribute('data-slide')),
				tlOut: this.tlOut(slide, slide.getAttribute('data-slide')),
				closeup
			}		
			
			this.slides.push(slideItem)
		}
	}

	tlIn(dom, type):GSAPTimeline{
		

		const tl = gsap.timeline({paused: true, onComplete: () => {
			this.changeInProgress = false;
		}});

		if(type === 'initialSlide'){

			tl
			.addLabel('start')
			.set(dom, {
				yPercent: 5,
				autoAlpha: 0,
			})
			.to(dom, {
				duration: D,
				yPercent: 0,
				autoAlpha: 1,
				ease: 'power1.inOut'
			})

			return tl;
		}

		tl
		.addLabel('start')
		.set(dom, {
			xPercent: -20,
			autoAlpha: 0,
		})
		.to(dom, {
			duration: D,
			xPercent: 0,
			autoAlpha: 1,
			ease: 'power1.inOut'
		})

		return tl;
	}

	tlOut(dom, type):GSAPTimeline{

		const tl = gsap.timeline({paused: true, onStart: () => {
			this.changeInProgress = true;
		}})

		if(type === 'initialSlide'){

			tl
			.addLabel('start')
			.to(dom, {
				duration: D,
				yPercent: 5,
				autoAlpha: 0,
				ease: 'power1.inOut'
			})

			return tl;
		}


		tl
		.addLabel('start')
		.to(dom, {
			duration: D,
			xPercent: -20,
			autoAlpha: 0,
			ease: 'power1.inOut'
		})


		return tl;

	}

	addEventListeners(): void {
		super.addEventListeners();

		for(const slide of this.slides){
			const buttons = slide.dom.querySelectorAll('.buttons__wrapper button');

			for( const button of buttons){
				const id = button.getAttribute('data-button');
				const type = id.includes('prev') ? 'prev' : id.includes('next') ? 'next' : 'share';

				button.addEventListener('click', () => {
					if(this.changeInProgress) return;
					
					this.slides[this.activeSlide].tlOut.play(0);
					
					solarClock.resume();

					if(this.solarElement){
						this.solarElement.selected = false;
					}

					if(type === 'prev') {
						this.prev();
						return;
					}
					if(type === 'next') {
						this.next();
						return;
					}
				})
			}

		}


	}

	share(){

	}

	prev(){

		if(this.activeSlide === 0){
			return;
		}

		this.activeSlide--;
		this.move();	
	}

	next(){

		this.activeSlide++;

		if(this.activeSlide >= this.slides.length) this.activeSlide = 0;

		this.move();	
	}

	move(){

		if(this.slides[this.activeSlide].closeup){
			
			this.solarElement = CoreAppSingleton.instance.solarElements.find(x => x.name === this.slides[this.activeSlide].closeup);
			
			if(this.solarElement) {
				CoreAppSingleton.instance.lock();
				solarClock.pause();
				this.solarElement.selected = true;
				CameraManager.goToTarget(this.solarElement, false, false);
			}
		} else {
			this.solarElement = null;
			CameraManager.goToTarget(CoreAppSingleton.instance.sun, true);
		}
		
		setTimeout(() => {

			for(const slide of this.slides)	slide.dom.classList.remove('active')

			this.slides[this.activeSlide].dom.classList.add('active');
			this.slides[this.activeSlide].tlIn.play(0);

			
		}, D * 1000);

		

	}
}