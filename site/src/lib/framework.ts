export type FrameworkData = {
	name: string | undefined
	sandbox: string
	lightColor: string
	darkColor: string
}

export const FRAMEWORKS = {
	react: {
		name: 'React',
		sandbox: 'https://codesandbox.io/p/sandbox/r47dcw',
		lightColor: '10 126 164',
		darkColor: '88 196 220'
	},
	vue: {
		name: 'Vue',
		sandbox: 'https://codesandbox.io/p/devbox/number-flow-vue-7t7y6y',
		lightColor: '66 184 131',
		darkColor: '66 184 131'
	},
	svelte: {
		name: 'Svelte',
		sandbox:
			'https://codesandbox.io/p/devbox/number-flow-svelte-xshsw4?file=%2Fsrc%2Froutes%2F%2Bpage.svelte',
		lightColor: '255 62 0',
		darkColor: '249 104 68'
	},
	vanilla: {
		name: 'Vanilla',
		sandbox: '',
		lightColor: '247 223 30',
		darkColor: '247 223 30'
	}
} satisfies Record<string, FrameworkData>

export type Framework = keyof typeof FRAMEWORKS

export const DEFAULT_FRAMEWORK: Framework = 'react'

export const getFramework = (params: Record<string, string | undefined>) =>
	'framework' in params ? ((params.framework as Framework) ?? DEFAULT_FRAMEWORK) : null

export const getStaticPaths = () =>
	Object.keys(FRAMEWORKS).map((id) => ({
		params: { framework: id === DEFAULT_FRAMEWORK ? undefined : id }
	}))

export const toFrameworkPath = (
	urlOrPathname?: string | URL | Location | null,
	id?: Framework | false | null
) => {
	if (!urlOrPathname) return
	const path = typeof urlOrPathname === 'string' ? urlOrPathname : urlOrPathname.pathname
	if (!id) return path
	const [_, firstSegment, ...segments] = path.split('/')

	// New prefix to prepend, based on new framework:
	const prefix = id === DEFAULT_FRAMEWORK ? '' : '/' + id

	if (firstSegment && Object.keys(FRAMEWORKS).includes(firstSegment))
		return prefix + '/' + segments.join('/')
	// It was on the default framework
	return prefix + path
}
