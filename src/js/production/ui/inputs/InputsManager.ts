import { Checkbox } from "./Checkbox";
import { DateInput } from "./DateInput";
import { DoubleRange } from "./DoubleRange";
import { Asteroids } from "./filters/Asteroids";
import { Centaurs } from "./filters/Centaurs";
import { Comets } from "./filters/Comets";
import { InterstellarObjects } from "./filters/InterstellarObjects";
import { NearEarthObjects } from "./filters/NearEarthObjects";
import { PlanetsMoons } from "./filters/PlantsMoons";
import { TransNeptunianObjects } from "./filters/TransNeptunianObjects";
import { Input } from "./Input";
import { Radio } from "./Radio";
import { TimePickerRange } from "./TimePickerRange";
import { ZoomRange } from "./ZoomRange";

interface inputInterface {
	parentTemplate: string,
	type: string
	input: Input
}

export const inputs:Array<inputInterface> = [];

export const addInputs = (dom: HTMLElement) => {

			if(!dom) return;

			const _inputs = dom.querySelectorAll('.custom-input');
			for(const input of _inputs){

				const el = input as HTMLElement;
				const type = el.getAttribute('type');

				let item = {
					parentTemplate: dom.getAttribute('data-template'),
					type,
					input: null
				}

				if(type === 'checkbox') {
					if(el.getAttribute('name') === 'near-earth-objects') item.input = new NearEarthObjects(el);
					if(el.getAttribute('name') === 'asteroids') item.input = new Asteroids(el);
					if(el.getAttribute('name') === 'interstellar-objects') item.input = new InterstellarObjects(el);
					if(el.getAttribute('name') === 'trans-neptunian-objects') item.input = new TransNeptunianObjects(el);
					if(el.getAttribute('name') === 'comets') item.input = new Comets(el);
					if(el.getAttribute('name') === 'planets-moons') item.input = new PlanetsMoons(el);
					if(el.getAttribute('name') === 'centaurs') item.input = new Centaurs(el);
					else item.input = new Checkbox(el)
				}
				if(type === 'radio') item.input = new Radio(el)
				if(type === 'double-range') item.input = new DoubleRange(el)
				if(type === 'range') {
					if(el.hasAttribute('data-zoom')) item.input = new ZoomRange(el)
					if(el.hasAttribute('data-timer')) item.input = new TimePickerRange(el)
				}
				if(el.hasAttribute('data-date')) item.input = new DateInput(el);

				if(item) inputs.push(item);

			}

}

export const updateInputs = () => {
	if(inputs.length === 0) return
	for(const input of inputs) input.input.update();
}