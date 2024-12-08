interface Props {
    children: string;
    heading: string;
}

const NPArticle = ({ children, heading }: Props) => {
    return (
        <div>
            <img src="src/assets/newspaper.jpg" className="article-background"></img>

            <p className="article article-heading">{heading}</p>
            <p className="article article-text"><br /><br />{children}</p>
        </div>
    )
}

export default NPArticle;
