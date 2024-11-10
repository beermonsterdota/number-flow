import * as React from 'react'
import Demo, {
	DemoMenu,
	DemoMenuButton,
	DemoMenuItem,
	DemoMenuItems,
	type DemoProps
} from '@/components/Demo'
import NumberFlow from '@number-flow/react'
import useCycle from '@/hooks/useCycle'
import type { KeyOfMap } from '@/lib/types'

const NUMBERS = [20, 19]

const OPTIONS = new Map([
	['default', undefined],
	['+1', 1],
	['0', 0],
	['-1', -1]
])

export default function DemoHOC({ ...rest }: Omit<DemoProps, 'children' | 'code'>) {
	const [value, cycleValue] = useCycle(NUMBERS)

	const [label, setLabel] = React.useState<KeyOfMap<typeof OPTIONS>>('default')
	const trend = OPTIONS.get(label)

	return (
		<Demo
			{...rest}
			title={
				<DemoMenu>
					<DemoMenuButton className="gap-1">
						<code className="text-muted">trend:</code>
						<code className="font-semibold">{label}</code>
					</DemoMenuButton>
					<DemoMenuItems>
						{Array.from(OPTIONS.keys()).map((l) => (
							<DemoMenuItem onClick={() => setLabel(l)} disabled={label === l}>
								<code className="font-semibold">{l}</code>
							</DemoMenuItem>
						))}
					</DemoMenuItems>
				</DemoMenu>
			}
			onClick={cycleValue}
		>
			<NumberFlow
				trend={trend}
				value={value}
				className="~text-xl/4xl text-primary font-semibold"
				style={{ '--number-flow-char-height': '0.85em' }}
			/>
		</Demo>
	)
}
