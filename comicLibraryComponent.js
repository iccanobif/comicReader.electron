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
        return React.createElement(
            React.Fragment,
            null,
            this.props.comicList.map((x, i) =>
                React.createElement(
                    "a",
                    {
                        key: x.title,
                        href: "#",
                        className: i == this.state.selectedIndex ? "comicLink" : "comicLink",
                        onClick: (e) =>
                        {
                            e.preventDefault()
                            this.props.comicSelectedHandler(x)
                        }
                    },
                    x.title))
        )
    }
}

