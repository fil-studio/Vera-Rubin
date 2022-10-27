import { Input } from "./Input";


export class DoubleRange extends Input {
	value1: number = 0;
	value2: number = 0;
	addEventListeners(): void {
		// const handles = this.dom.querySelectorAll('label');
		const first = this.dom.querySelector('input[name="first"]') as HTMLInputElement;
		const second = this.dom.querySelector('input[name="second"]') as HTMLInputElement;
		
		this.value1 = first.valueAsNumber;
		this.value2 = second.valueAsNumber;		

		const offset = 0.07;

		this.updateValues();

		first.addEventListener('input', (e) => {	
			this.value2 = second.valueAsNumber;		
			if(first.valueAsNumber >= this.value2 - offset) first.valueAsNumber = this.value1;
			else this.value1 = first.valueAsNumber;
			this.dom.style.setProperty('--range-1', first.value);			
			this.updateValues();
		})
		second.addEventListener('input', (e) => {
			this.value1 = first.valueAsNumber;
			if(second.valueAsNumber - offset <= this.value1) second.valueAsNumber = this.value2;
			else this.value2 = second.valueAsNumber;			
			this.dom.style.setProperty('--range-2', second.value);
			this.updateValues();
		})
		
	}

	updateValues(){
		
	}
}