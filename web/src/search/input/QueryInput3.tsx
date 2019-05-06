import React from 'react'
import { TokenTextInput } from '../../../../shared/src/components/tokenTextInput/TokenTextInput'
import { QueryInputInlineOptions } from './query/QueryInputInlineOptions'
import { QueryInputProps } from './QueryInput'

interface Props extends QueryInputProps {}

export const QueryInput3: React.FunctionComponent<Props> = ({ value, onChange }) => (
    <div className="query-input3 input-group border align-items-start" style={{ backgroundColor: 'var(--input-bg)' }}>
        <TokenTextInput
            className="form-control border-0 query-input2__input rounded-left e2e-query-input"
            value={value}
            onChange={onChange}
            placeholder="Search code..."
        />
        <QueryInputInlineOptions className="input-group-append" />
    </div>
)
