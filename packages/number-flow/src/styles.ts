import { BROWSER } from './util/env'
import { css } from './util/css'

export const supportsLinear =
	BROWSER &&
	typeof CSS !== 'undefined' &&
	CSS.supports &&
	CSS.supports('animation-timing-function', 'linear(1,2)')

export const supportsMod =
	BROWSER && typeof CSS !== 'undefined' && CSS.supports && CSS.supports('line-height', 'mod(1,1)')

export const prefersReducedMotion =
	BROWSER && matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null

// Register animated vars:
export const opacityDeltaVar = '--_number-flow-d-opacity'
export const widthDeltaVar = '--_number-flow-d-width'
export const dxVar = '--_number-flow-dx'
export const deltaVar = '--_number-flow-d'

export const supportsAtProperty = (() => {
	try {
		CSS.registerProperty({
			name: opacityDeltaVar,
			syntax: '<number>',
			inherits: false,
			initialValue: '0'
		})

		CSS.registerProperty({
			name: dxVar,
			syntax: '<length>',
			inherits: true,
			initialValue: '0px'
		})

		CSS.registerProperty({
			name: widthDeltaVar,
			syntax: '<number>',
			inherits: false,
			initialValue: '0'
		})

		CSS.registerProperty({
			name: deltaVar,
			syntax: '<number>',
			inherits: true,
			initialValue: '0'
		})
		return true
	} catch {
		return false
	}
})()

// Don't use CSS.registerProperty for vars needed during SSR:
export const charHeight = 'var(--number-flow-char-height, 1em)'

// Mask technique taken from:
// https://expensive.toys/blog/blur-vignette
export const maskHeight = 'var(--number-flow-mask-height, 0.25em)'
const halfMaskHeight = `calc(${maskHeight} / 2)`
const maskWidth = 'var(--number-flow-mask-width, 0.5em)'
const scaledMaskWidth = `calc(${maskWidth} / var(--scale-x))`

const cornerGradient = `#000 0, transparent 71%` // or transparent ${maskWidth}

export const SlottedTag = 'span'

const styles = css`
	:host {
		display: inline-flex; /* seems better at matching baselines with other inline elements */
		align-items: baseline; /* ^ */
		direction: ltr;
		white-space: nowrap;
		/* for invisible slotted label used for screen readers and selecting: */
		position: relative;
		line-height: ${charHeight} !important;
		isolation: isolate;
	}

	::slotted(${SlottedTag}) {
		position: absolute;
		left: 0;
		top: 0;
		color: transparent !important;
		will-change: unset !important;
		z-index: -5;
	}

	:host > .number,
	:host > .section {
		pointer-events: none;
		user-select: none;
	}

	.number,
	.number__inner {
		display: inline-flex;
		align-items: baseline;
		transform-origin: left top;
	}

	:host([data-will-change]) .number,
	:host([data-will-change]) .number__inner {
		will-change: transform;
	}

	.number {
		--scale-x: calc(1 + var(${widthDeltaVar}) / var(--width));
		transform: translateX(var(${dxVar})) scaleX(var(--scale-x));

		margin: 0 calc(-1 * ${maskWidth});
		position: relative; /* for z-index */
		z-index: -1; /* display underneath other sections */

		overflow: clip; /* important so it doesn't affect page layout */
		/* -webkit- prefixed properties have better support than unprefixed ones: */
		-webkit-mask-image:
			/* Horizontal: */
			linear-gradient(
				to right,
				transparent 0,
				#000 ${scaledMaskWidth},
				#000 calc(100% - ${scaledMaskWidth}),
				transparent
			),
			/* Vertical: */
				linear-gradient(
					to bottom,
					transparent 0,
					#000 ${maskHeight},
					#000 calc(100% - ${maskHeight}),
					transparent 100%
				),
			/* TL corner */ radial-gradient(at bottom right, ${cornerGradient}),
			/* TR corner */ radial-gradient(at bottom left, ${cornerGradient}),
			/* BR corner */ radial-gradient(at top left, ${cornerGradient}),
			/* BL corner */ radial-gradient(at top right, ${cornerGradient});
		-webkit-mask-size:
			100% calc(100% - ${maskHeight} * 2),
			calc(100% - ${scaledMaskWidth} * 2) 100%,
			${scaledMaskWidth} ${maskHeight},
			${scaledMaskWidth} ${maskHeight},
			${scaledMaskWidth} ${maskHeight},
			${scaledMaskWidth} ${maskHeight};
		-webkit-mask-position:
			center,
			center,
			top left,
			top right,
			bottom right,
			bottom left;
		-webkit-mask-repeat: no-repeat;
	}

	.number__inner {
		padding: 0 ${maskWidth};
		/* invert parent's: */
		transform: scaleX(calc(1 / var(--scale-x))) translateX(calc(-1 * var(${dxVar})));
	}

	.section {
		display: inline-flex;
		align-items: baseline;
		padding-bottom: ${halfMaskHeight};
		padding-top: ${halfMaskHeight};
		/* for .section__exiting: */
		position: relative;
		isolation: isolate;
	}

	.section::after {
		/*
		 * We seem to need some type of character to ensure align-items: baseline continues working
		 * even when empty
		 */
		content: '\200b'; /* zero-width space */
		display: block;
		padding: ${halfMaskHeight} 0;
	}

	:host([data-will-change]) .section {
		will-change: transform;
	}

	.section--justify-left {
		transform-origin: center left;
	}

	.section--justify-right {
		transform-origin: center right;
	}

	.section__exiting {
		position: absolute !important;
		z-index: -1;
		/* top: 0; this seemed to backfire */
	}

	.digit {
		display: block;
		position: relative;
		--c: var(--current) + var(${deltaVar});
	}

	:host([data-will-change]) .digit,
	:host([data-will-change]) .digit__num {
		will-change: transform;
	}

	.digit__num {
		display: block;
		padding: ${halfMaskHeight} 0;
		/* Claude + https://buildui.com/recipes/animated-counter */
		--offset-raw: mod(10 + var(--n) - mod(var(--c), 10), 10);
		--offset: calc(var(--offset-raw) - 10 * round(down, var(--offset-raw) / 5, 1));
		/* Technically we just need var(--offset)*100%, but clamping should reduce the layer size: */
		--y: clamp(-100%, var(--offset) * 100%, 100%);
		transform: translateY(var(--y));
	}

	.digit__num:not(.is-current) {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%) translateY(var(--y));
	}

	.digit:not(.is-spinning) .digit__num:not(.is-current) {
		display: none;
	}

	.symbol {
		display: inline-flex;
		align-items: baseline;
		position: relative;
		isolation: isolate;
		padding: ${halfMaskHeight} 0;
	}

	:host([data-will-change]) .symbol {
		will-change: transform;
	}

	.symbol__value {
		display: block;
		white-space: pre; /* some symbols are spaces or thin spaces */
	}

	.symbol__exiting {
		position: absolute;
		z-index: -1;
	}

	.section--justify-left .symbol__exiting {
		left: 0;
	}

	.section--justify-right .symbol__exiting {
		right: 0;
	}

	.animate-presence {
		opacity: calc(1 + var(${opacityDeltaVar}));
	}
`

export default styles
