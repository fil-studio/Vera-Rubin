import { MathUtils } from "@jocabola/math";
import { Input } from "./Input";


export class DoubleRange extends Input {
	value1: number = 0;
	value2: number = 0;

	handles: NodeListOf<HTMLElement>
	range: HTMLElement;
	addEventListeners(): void {

		const first = this.dom.querySelector('input[name="first"]') as HTMLInputElement;
		const second = this.dom.querySelector('input[name="second"]') as HTMLInputElement;

		this.value1 = first.valueAsNumber;
		this.value2 = second.valueAsNumber;		

		this.handles = this.dom.querySelectorAll('.handle div');

		for(const el of this.handles){
			this.handleListeners(el)
		}





		// const offset = 0.07;

		// this.updateValues();

		// first.addEventListener('input', (e) => {	
		// 	this.value2 = second.valueAsNumber;		
		// 	if(first.valueAsNumber >= this.value2 - offset) first.valueAsNumber = this.value1;
		// 	else this.value1 = first.valueAsNumber;
		// 	this.dom.style.setProperty('--range-1', first.value);			
		// 	this.updateValues();
		// })
		// second.addEventListener('input', (e) => {
		// 	this.value1 = first.valueAsNumber;
		// 	if(second.valueAsNumber - offset <= this.value1) second.valueAsNumber = this.value2;
		// 	else this.value2 = second.valueAsNumber;			
		// 	this.dom.style.setProperty('--range-2', second.value);
		// 	this.updateValues();
		// })
		
	}

	handleListeners(el){
		const active = el.parentElement.classList.contains('handle-1') ? 1 : 2;

		let dragging = false;
		let x = 0;
		let w = 0;
		let originalValue = 0;

		const dom = active === 1 ? this.dom.querySelector('input[name="first"]') as HTMLInputElement : this.dom.querySelector('input[name="second"]') as HTMLInputElement;

		el.addEventListener('mousedown', (ev) => {
			dragging = true;
			x = ev.clientX;

			const first = this.dom.querySelector('input[name="first"]') as HTMLInputElement;
			const second = this.dom.querySelector('input[name="second"]') as HTMLInputElement;

			this.value1 = first.valueAsNumber;
			this.value2 = second.valueAsNumber;		

			const range = this.dom.getBoundingClientRect();
			w = range.width;
			
			originalValue = MathUtils.map(active === 1 ? this.value1 : this.value2, 0, 1, 0, w);
			
			window.addEventListener('mouseup', () => {
				dragging = false;
				x = 0;
				this.updateValues();
			}, { once: true })

		})

		window.addEventListener('mousemove', (ev) => {
			if(!dragging) return;

			const movementDistance = originalValue + (ev.clientX - x);

			// offset to prevent handle overlap
			const offset = 0.075;
			const min = active === 1 ? 0 : this.value1 + offset;
			const max = active === 1 ? this.value2 - offset : 1;

			const newValue = MathUtils.clamp(MathUtils.map(movementDistance, 0, w, 0, 1), min, max);
			dom.valueAsNumber = newValue;
			this.dom.style.setProperty(`--range-${active}`, newValue.toString());
			if(active === 1) this.value1 = newValue;
			else this.value2 = newValue;
			dom.value = `${newValue}`;

		})
	}


	updateValues(){
		
	}
}