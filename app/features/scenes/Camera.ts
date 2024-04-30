import { Vector, type VectorInputArgs } from "../../common/vector.ts"

interface CameraState {
	position: Vector
	zoomTick: number
}

export class Camera {
	static readonly zoomBase = 1.3
	static readonly zoomTickLimit = 10

	static getScale(zoomTick: number): number {
		return Camera.zoomBase ** zoomTick
	}

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
		return Camera.getScale(this.zoomTick)
	}

	movedBy(...delta: VectorInputArgs): Camera {
		return new Camera({
			...this.#state,
			position: this.#state.position.plus(...delta),
		})
	}

	zoomedBy(delta: number, pivot: Vector): Camera {
		const newZoomTick = this.zoomTick + delta
		if (newZoomTick <= -Camera.zoomTickLimit || newZoomTick >= Camera.zoomTickLimit) {
			return this
		}

		const currentScale = this.scale
		const newScale = Camera.getScale(this.zoomTick + delta)
		const shift = pivot.minus(pivot.times(newScale / currentScale))

		return new Camera({
			...this.#state,
			position: this.position.plus(shift),
			zoomTick: this.#state.zoomTick + delta,
		})
	}

	viewportToWorld(point: Vector) {
		return point.minus(this.position).dividedBy(this.scale)
	}

	worldToViewport(point: Vector) {
		return point.times(this.scale).plus(this.position)
	}
}
