import gsap from "gsap";
import { isPortrait } from "../utils/Helpers";
import { Page } from "./Page";


export class Tours extends Page {
	chevs:NodeListOf<HTMLElement>;
	playing: boolean = false;

	onLoaded(){
		this.chevs = this.dom.querySelectorAll('.tour-pagination svg');
		this.checkWidth();
	}

	playChev(chev, direction){
		if(this.playing) return;
		this.playing = true;

		gsap.to(chev, {
			duration: 0.6,
			x: direction === 'left' ? '-=10px' : '+=10px',
			scaleY: 0.9,
			transformOrigin: 'center',
			ease: 'power2.inOut',
			onComplete: () => {
				gsap.to(chev, {
					duration: 0.6,
					x: 0,
					scaleY: 1,
					transformOrigin: 'center',
					ease: 'power2.inOut',
					onComplete: () => {
						this.playing = false;
					}
				});
			}
		})

	}

	checkWidth(){

		if(!this.dom) return;

		const list = this.dom.querySelector('.tours-list') as HTMLElement;
		if(!list) return;
		const items = list.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
		if(items.length === 0) return;

		const size = {
			w: 60,
			h: 60
		};

		for(const item of items){
			const r = item.getBoundingClientRect();
			size.w += r.width;
			size.h += r.height;
		}

		list.style.width = 'auto';
		list.style.height = 'auto';

		if(isPortrait()) list.style.height = `${size.h}px`;
		else list.style.width = `${size.w}px`;
		
	}

	onResize(): void {
		this.checkWidth();
	}

	addEventListeners(): void {
		super.addEventListeners();
		
		this.chevs[0].addEventListener('mouseenter', () => {
			this.playChev(this.chevs[0], 'left')
		})
		this.chevs[1].addEventListener('mouseenter', () => {
			this.playChev(this.chevs[1], 'right')
		})
	}



}