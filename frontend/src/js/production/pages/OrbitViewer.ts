import { Search } from "../partials/Search";
import { TimePicker } from "../partials/TimePicker";
import { Page } from "./Page";


export class OrbitViewer extends Page {
	load(resolve: any): void {
	
		new Search(this.dom);

		new TimePicker(this.dom);

		super.load(resolve)
	}

	addEventListeners(): void {

		this.addCustomizeView();
		
	}

	addCustomizeView(){

		const wrapper = this.dom.querySelector('.customize-view');

		const btn = wrapper.querySelector('.customize-view-icon');
		btn.addEventListener('click', () => {
			wrapper.classList.toggle('active');
		})

		document.addEventListener('keydown', (e) => {			

			if(e.key != 'Escape') return;

			if(!wrapper.classList.contains('active')) return;

			e.preventDefault();

			wrapper.classList.remove('active');
		})
	}
}