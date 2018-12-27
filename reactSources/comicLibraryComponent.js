'use strict'

const $ = require("jquery")

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
            case "Escape":
                this.props.onWantToClosePopup()
                break;
        }
    }
    componentDidMount()
    {
        document.getElementById("libraryFilterText").focus()
    }
    render() 
    {
        return (
            <form>
                <input
                    id="libraryFilterText"
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
                            className={
                                i == (this.props.selectedIndex % this.props.comicList.length)
                                    ? "selectedComicLink"
                                    : "comicLink"}
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
            // For simplicity, selectedIndex can go <0 and >comicList.length, I can just use a modulo when I need to actually fetch the selected comic
            selectedIndex: 0
        }
        this.handleFilterTextChange = this.handleFilterTextChange.bind(this)
        this.handleMoveUp = this.handleMoveUp.bind(this)
        this.handleMoveDown = this.handleMoveDown.bind(this)
        this.handleSelectionConfirmed = this.handleSelectionConfirmed.bind(this)
        this.handleWantToClosePopup = this.handleWantToClosePopup.bind(this)
    }
    handleFilterTextChange(filterText)
    {
        this.setState({
            filterText: filterText,
            selectedIndex: 0
        })
    }
    handleMoveUp()
    {
        this.setState({
            selectedIndex: this.state.selectedIndex - 1
        })
    }
    handleMoveDown()
    {
        this.setState({
            selectedIndex: this.state.selectedIndex + 1
        })
    }
    handleSelectionConfirmed()
    {
        const filteredList = this.getFilteredComicList()
        const selectedComic = filteredList[this.state.selectedIndex % filteredList.length]
        this.props.onComicSelected(selectedComic)
    }
    handleWantToClosePopup()
    {
        this.props.onWantToClosePopup()
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
                    onWantToClosePopup={this.handleWantToClosePopup}
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

