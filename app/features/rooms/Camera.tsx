import { Vector, type VectorInput } from "#app/common/vector.js"

interface CameraState {
	position: Vector
	zoomTick: number
}

export class Camera {
	static readonly zoomBase = 1.3
	static readonly zoomTickLimit = 10

	readonly #state: CameraState = {
		position: Vector.zero,
		zoomTick: 0,
	}

	constructor(state?: CameraState) {
		this.#state = state ?? this.#state
	}

	get position(): Vector {
		return this.#state.position
	}

	get zoomTick(): number {
		return this.#state.zoomTick
	}

	get translation(): Vector {
		return this.position.times(this.scale)
	}

	get scale(): number {
		return Camera.zoomBase ** this.zoomTick
	}

	movedBy(...delta: VectorInput): Camera {
		return new Camera({
			...this.#state,
			position: this.#state.position.plus(...delta),
		})
	}
}
