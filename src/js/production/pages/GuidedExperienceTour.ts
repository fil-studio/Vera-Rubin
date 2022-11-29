import gsap from "gsap";
import { CameraManager } from "../../common/core/CameraManager";
import { CoreAppSingleton } from "../../common/core/CoreApp";
import { disablePopup, enablePopup } from "../ui/popups/PopupsManager";
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
	bullets: NodeListOf<HTMLElement>;

	onLoaded(){
		this.createSlides();

		this.bullets = this.dom.querySelectorAll('.bullets div');

		this.checkBullets();

		for(const slide of this.slides){
			if(slide === this.slides[this.activeSlide]) continue;
			gsap.set(slide.dom, {
				xPercent: -5,
				autoAlpha: 0,
			})
		}
	}

	checkBullets(){
		if (this.activeSlide === 0 || this.activeSlide === this.slides.length - 1) this.dom.querySelector('.bullets').classList.add('hidden');
		else this.dom.querySelector('.bullets').classList.remove('hidden');

		for(const bullet of this.bullets) bullet.classList.remove('active');
		this.bullets[this.activeSlide].classList.add('active');
	}

	disable(): void {
		super.disable();
		document.querySelector('.popups-labels').style.opacity = '';
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

			if(slideItem.type === 'defaultSlide'){
				const content = slideItem.dom.querySelector('.content')
				content.addEventListener('click', () => {
					content.classList.toggle('folded');
				})
			}
		}

		this.setSlidesHeight();
	}

	setSlidesHeight(){

		for(const slide of this.slides){
			if(slide.type != 'defaultSlide') continue;
			
			const p = slide.dom.querySelector('.content p');
			if(!p) continue;

			p.style.height = 'auto';
			const rect = p.getBoundingClientRect();
			p.style.height = '';
			p.style.setProperty('--height', `${rect.height}px`);			
		}
		
	}

	onResize(): void {
		super.onResize();
		this.setSlidesHeight();
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
			xPercent: -5,
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
			xPercent: -5,
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
					this.hidePopups();
	
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

	hide(): void {
		super.hide();
		this.hidePopups()
	}

	hidePopups() {
		document.querySelector('.popups-labels').style.opacity = '0';
		disablePopup();
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

		const closeup = this.slides[this.activeSlide].closeup;
		if(closeup){
			const solarElement = CoreAppSingleton.instance.solarElements.find(x => x.name === closeup);
			if(!solarElement.closeUp) document.querySelector('.popups-labels').style.opacity = '1';
			enablePopup(closeup, false);
		} else {
			CameraManager.goToTarget(CoreAppSingleton.instance.sun, true);
		}


		this.checkBullets();
		
		setTimeout(() => {

			for(const slide of this.slides)	slide.dom.classList.remove('active')

			this.slides[this.activeSlide].dom.classList.add('active');
			this.slides[this.activeSlide].tlIn.play(0);

			
		}, D * 1000);

	}
}