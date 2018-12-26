'use strict';

class LibraryComponent extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = { selectedIndex: 0 }
    }
    render()
    {
        return (
            <React.Fragment>
                {
                    this.props.comicList.map((x, i) =>
                    {
                        return <a
                            key={x.title}
                            href="#"
                            className={i == this.state.selectedIndex ? "comicLink" : "comicLink"}
                            onClick={(e) =>
                            {
                                e.preventDefault()
                                this.props.comicSelectedHandler(x)
                            }}>
                            {x.title}
                        </a>
                    })
                }
            </React.Fragment>
        )
    }
}

