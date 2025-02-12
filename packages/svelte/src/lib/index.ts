import {
	canAnimate as _canAnimate,
	prefersReducedMotion as _prefersReducedMotion
} from '@beermonster/number-flow'
import { onMount } from 'svelte'
import { derived, readable } from 'svelte/store'

export type { Value, Format, Trend } from '@beermonster/number-flow'
export * from '@beermonster/number-flow/plugins'
export { default as NumberFlowGroup } from './NumberFlowGroup.svelte'
export { default, NumberFlowElement } from './NumberFlow.svelte'

const canAnimate = readable(false, (set) => {
	onMount(() => {
		set(_canAnimate)
	})
})

const prefersReducedMotion = readable(false, (set) => {
	onMount(() => {
		set(_prefersReducedMotion?.matches ?? false)
		const onChange = ({ matches }: MediaQueryListEvent) => {
			set(matches)
		}
		_prefersReducedMotion?.addEventListener('change', onChange)
		return () => {
			_prefersReducedMotion?.removeEventListener('change', onChange)
		}
	})
})

const canAnimateWithPreference = derived(
	[canAnimate, prefersReducedMotion],
	([canAnimate, prefersReducedMotion]) => canAnimate && !prefersReducedMotion
)

export const getCanAnimate = ({ respectMotionPreference = true } = {}) =>
	respectMotionPreference ? canAnimateWithPreference : canAnimate
