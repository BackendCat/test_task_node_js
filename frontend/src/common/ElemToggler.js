import { useState } from "react";


const ElemToggler = ({
                         first = "",
                         second = "",
                         onToggle = () => null,
                         allowHover = false,
                         className = "",
                         style = {}
                     }) => {
    const [isOn, setIsOn] = useState(false);

    const toggle = () => {
        setIsOn(prev => !prev);
        onToggle();
    };

    // Inf re-rendering otherwise
    const hover = debounce => debounce && allowHover && toggle();

    return (
        <div
            className={className}
            style={{...style, cursor: "pointer"}}
            onMouseEnter={() => hover(!isOn)}
            onMouseLeave={() => hover(isOn)}
            onClick={() => !allowHover && toggle()}>
            {isOn ? second : first}
        </div>
    );
};


export default ElemToggler;
