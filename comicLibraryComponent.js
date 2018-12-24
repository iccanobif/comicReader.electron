'use strict';


class LibraryComponent extends React.Component
{
    constructor(props)
    {
        super(props);
    }
    render()
    {
        return React.createElement(
            "div",
            {id: "merdaccia"},
            this.props.comicList.map(x => React.createElement(
                "a",
                {
                    key: x.title,
                    href: "#",
                    className: "comicLink",
                    onClick: (e) =>
                    {
                        e.preventDefault()
                        alert(x.title)
                    }
                },
                x.title
            ))
        )
        // React.createElement(
        //     React.Fragment,
        //     null,
        //     [React.createElement(
        //         'a',
        //         {
        //             onClick: (e) =>
        //             {
        //                 e.preventDefault()
        //                 this.setState({ liked: true })
        //             },
        //             href: "#"
        //         },
        //         this.state.liked ? "liked" : "like")
        //     ].concat(
    }
}

