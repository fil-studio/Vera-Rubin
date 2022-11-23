import { Radio } from "./Radio";

export class RadioSortTours extends Radio {
	reset(): void {
		this.options[0].checked = true;
		this.checkState();
		this.updateValues();

	}
	updateValues() {
		
		const page = document.querySelector('.page__content:not(.disabled)');
		page.querySelector('.tours-list').setAttribute('sort', this.dom.value)
		
	}
}