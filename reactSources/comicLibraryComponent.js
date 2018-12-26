'use strict';

class Filter extends React.Component
{
    constructor(props)
    {
        super(props)
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
    }
    handleFilterTextChange(e)
    {
        this.props.onFilterTextChange(e.target.value)
    }
    render() 
    {
        return (
            <form>
                <input
                    type="text"
                    placeholder="Search..."
                    value={this.props.filterText}
                    onChange={this.handleFilterTextChange}
                />
            </form>
        )
    }
}

class ComicList extends React.Component
{
    constructor(props)
    {
        super(props)
    }
    render()
    {
        return (
            <div>
                {
                    this.props.comicList.map((comic, i) =>
                    {
                        return <a
                            key={comic.title}
                            href="#"
                            className={i == this.props.selectedIndex ? "comicLink" : "comicLink"}
                            onClick={(e) =>
                            {
                                e.preventDefault()
                                this.props.onComicSelected(comic)
                            }}>
                            {comic.title}
                        </a>
                    })
                }
            </div>
        )
    }
}

class FilterableComicList extends React.Component
{
    constructor(props)
    {
        super(props)
        this.state = {
            filterText: "",
            selectedIndex: 0
        }
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
    }
    handleFilterTextChange(filterText)
    {
        this.setState({
            filterText: filterText
        })
    }
    render()
    {
        return (
            <React.Fragment>
                <Filter
                    filterText={this.state.filterText}
                    onFilterTextChange={this.handleFilterTextChange}
                />
                <ComicList
                    comicList={this.props.comicList
                        .filter(comic =>
                        {
                            return comic.title.toUpperCase().indexOf(this.state.filterText.toUpperCase()) >= 0
                        })}
                    selectedIndex={this.state.selectedIndex}
                    onComicSelected={this.props.onComicSelected}
                />
            </React.Fragment>
        )
    }
}

