import React from 'react'
import renderer from 'react-test-renderer'
import { setLinkComponent } from '../../../../../shared/src/components/Link'
import { ListHeaderQueryLinks } from './ListHeaderQueryLinks'

// tslint:disable: jsx-no-lambda
describe('ListHeaderQueryLinks', () => {
    setLinkComponent((props: any) => <a {...props} />)
    afterAll(() => setLinkComponent(null as any)) // reset global env for other tests

    test('simple', () =>
        expect(
            renderer
                .create(
                    <ListHeaderQueryLinks
                        activeQuery="is:b"
                        links={[
                            { label: 'a', queryField: 'is', queryValue: 'a', count: 1 },
                            { label: 'b', queryField: 'is', queryValue: 'b', count: 2 },
                        ]}
                        location={{ search: 'a=b' }}
                    />
                )
                .toJSON()
        ).toMatchSnapshot())
})
