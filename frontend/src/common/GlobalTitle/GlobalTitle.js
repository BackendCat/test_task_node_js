import "./GlobalTitle.css";


const GlobalTitle = ({ text, className = "", ...props}) => {
    return (
        <h2 className={"global-title " + className} {...props}>{text}</h2>
    );
};


export default GlobalTitle;
