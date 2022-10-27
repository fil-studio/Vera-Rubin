import { distance } from "../../../common/data/FiltersManager";
import { DoubleRange } from "./DoubleRange";

export class DoubleRangeDistance extends DoubleRange {
	updateValues(){

		distance.value.min = this.value1;
		distance.value.max = this.value2;

	}
}