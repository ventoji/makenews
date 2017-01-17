import React, { Component, PropTypes } from "react";
import ReactDOM from "react-dom";
import Feed from "./Feed.jsx";
import { connect } from "react-redux";
import * as DisplayFeedActions from "../actions/DisplayFeedActions";

export class DisplayFeeds extends Component {
    constructor() {
        super();
        this.state = { "activeIndex": 0, "expandView": false };
        this.hasMoreFeeds = true;
        this.offset = 0;
        this.getMoreFeeds = this.getMoreFeeds.bind(this);
        this.getFeedsCallBack = this.getFeedsCallBack.bind(this);
    }

    componentDidMount() {
        window.scrollTo(0, 0); //eslint-disable-line no-magic-numbers
        this.dom = ReactDOM.findDOMNode(this);
        this.dom.addEventListener("scroll", this.getFeedsCallBack);
        this.getMoreFeeds(this.props.sourceType);
    }

    componentWillReceiveProps(nextProps) {
        if(this.props.sourceType !== nextProps.sourceType) {
            this.hasMoreFeeds = true;
            this.offset = 0;
            this.setState({ "activeIndex": 0 });
            this.getMoreFeeds(nextProps.sourceType);
            this.props.dispatch(DisplayFeedActions.clearFeeds());
        }
    }

    componentWillUnmount() {
        this.dom.removeEventListener("scroll", this.getFeedsCallBack);
    }

    getFeedsCallBack() {
        if (!this.timer) {
            const scrollTimeInterval = 250;
            this.timer = setTimeout(() => {
                this.timer = null;
                const scrollTop = this.dom.scrollTop;
                if (scrollTop && scrollTop + this.dom.clientHeight >= this.dom.scrollHeight) {
                    this.getMoreFeeds(this.props.sourceType);
                }
            }, scrollTimeInterval);
        }
    }

    getMoreFeeds(sourceType) {
        if (this.hasMoreFeeds) {
            if(sourceType === "bookmark") {
                this.props.dispatch(DisplayFeedActions.getBookmarkedFeeds(this.offset, (result) => {
                    this.offset = result.docsLength ? (this.offset + result.docsLength) : this.offset;
                    this.hasMoreFeeds = result.hasMoreFeeds;
                }));
            } else {
                this.props.dispatch(DisplayFeedActions.displayFeedsByPage(this.offset, sourceType, (result) => {
                    this.offset = result.docsLength ? (this.offset + result.docsLength) : this.offset;
                    this.hasMoreFeeds = result.hasMoreFeeds;
                }));
            }
        }
    }

    handleToggle(index) {
        this.setState({ "activeIndex": index });
    }

    _toggleFeedsView() {
        this.setState({ "expandFeedsView": !this.state.expandFeedsView });
    }

    render() {
        return (
            <div className={this.state.expandFeedsView ? "configured-feeds-container expand" : "configured-feeds-container"}>
                <button onClick={DisplayFeedActions.fetchFeedsFromSources} className="refresh-button">{"Refresh"}</button>
                <i onClick={() => {
                    this._toggleFeedsView();
                }} className="expand-icon"
                />
                <div className="feeds">
                    {this.props.feeds.map((feed, index) =>
                        <Feed feed={feed} key={index} active={index === this.state.activeIndex} selectFeedHandler={this.handleToggle.bind(this, index)}/>)}
                </div>
            </div>
        );
    }
}

function mapToStore(store) {
    return {
        "feeds": store.fetchedFeeds,
        "sourceType": store.newsBoardCurrentSourceTab
    };
}

DisplayFeeds.propTypes = {
    "dispatch": PropTypes.func.isRequired,
    "feeds": PropTypes.array.isRequired,
    "sourceType": PropTypes.string.isRequired
};

export default connect(mapToStore)(DisplayFeeds);
