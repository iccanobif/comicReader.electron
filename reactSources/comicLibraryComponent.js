'use strict';

class Filter extends React.Component
{
    constructor(props)
    {
        super(props)
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }
    handleFilterTextChange(e)
    {
        this.props.onFilterTextChange(e.target.value)
    }
    handleKeyDown(e)
    {
        switch (e.key)
        {
            case "ArrowDown":
                this.props.onMoveDown()
                break;
            case "ArrowUp":
                this.props.onMoveUp()
                break;
            case "Enter":
                this.props.onSelectionConfirmed()
                break;
        }
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
                    onKeyDown={this.handleKeyDown}
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
                            className={i == this.props.selectedIndex ? "selectedComicLink" : "comicLink"}
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
        this.handleMoveUp = this.handleMoveUp.bind(this)
        this.handleMoveDown = this.handleMoveDown.bind(this)
        this.handleSelectionConfirmed = this.handleSelectionConfirmed.bind(this)
    }
    handleFilterTextChange(filterText)
    {
        this.setState({
            filterText: filterText
        })
    }
    handleMoveUp()
    {
        this.setState({
            selectedIndex: Math.max(0, this.state.selectedIndex - 1)
        })
    }
    handleMoveDown()
    {
        this.setState({
            selectedIndex: this.state.selectedIndex + 1 // TODO prevent going out of bounds
        })
    }
    handleSelectionConfirmed()
    {
        const selectedComic = this.getFilteredComicList()[this.state.selectedIndex]
        this.props.onComicSelected(selectedComic)
    }
    getFilteredComicList()
    {
        return this.props.comicList
            .filter(comic =>
            {
                return comic.title.toUpperCase().indexOf(this.state.filterText.toUpperCase()) >= 0
            })
    }
    render()
    {
        return (
            <React.Fragment>
                <Filter
                    filterText={this.state.filterText}
                    onFilterTextChange={this.handleFilterTextChange}
                    onMoveDown={this.handleMoveDown}
                    onMoveUp={this.handleMoveUp}
                    onSelectionConfirmed={this.handleSelectionConfirmed}
                />
                <ComicList
                    comicList={this.getFilteredComicList()}
                    selectedIndex={this.state.selectedIndex}
                    onComicSelected={this.props.onComicSelected}
                />
            </React.Fragment>
        )
    }
}

