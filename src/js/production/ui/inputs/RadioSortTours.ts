import { Radio } from "./Radio";

export class RadioSortTours extends Radio {
	updateValues() {
		
		const page = document.querySelector('.page__content:not(.disabled)');
		page.querySelector('.tours-list').setAttribute('sort', this.dom.value)
		
	}
}