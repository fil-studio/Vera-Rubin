import { onChange } from "../pagination/History";
import { Search } from "../partials/Search";
import { expandableItems, initExpandableItems } from "../ui/expandable-items/ExpandableItems";
import { RAYCASTER } from "../ui/expandable-items/Raycaster";
import { Page } from "./Page";


export class OrbitViewer extends Page {
	load(resolve: any): void {
	
		new Search(this.dom);

		super.load(resolve)

	}

	show(): void {
		RAYCASTER.active = true;
	}
	hide(): void {
		RAYCASTER.active = false;
	}

	onResize(): void {
		
		super.onResize();

		for(const expandableItem of expandableItems) expandableItem.onResize();
	}

	addEventListeners(): void {

		this.addCustomizeView();

		initExpandableItems();
		
	}

	addCustomizeView(){

		const wrapper = this.dom.querySelector('.customize-view');

		const btn = wrapper.querySelector('.customize-view-icon');
		btn.addEventListener('click', () => {
			wrapper.classList.toggle('active');
		})

		this.dom.querySelector('.back-button button').addEventListener('click', () => {
			onChange('/');
		})

		document.addEventListener('keydown', (e) => {			

			if(e.key != 'Escape') return;

			if(!wrapper.classList.contains('active')) return;

			e.preventDefault();

			wrapper.classList.remove('active');
		})
	}

	update(): void {
		super.update();
		for(const expandableItem of expandableItems) expandableItem.update();
	}
}