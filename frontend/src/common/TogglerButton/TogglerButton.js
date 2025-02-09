import { useState } from "react";
import classNames from "classnames";
import "./TogglerButton.css";


const ToggleButton = ({left, right, defValue = null, toggler}) => {
    const [activeValue, setActiveValue] = useState(defValue || left);

    const handleToggle = value => {
        setActiveValue(value);
        toggler(value);
    };

    const buttonClass = value => classNames(
        "btn text-center toggle-button__button ",
        {"btn-dark toggle-button__button--active": value === activeValue},
        {"btn-light toggle-button__button--not-active": value !== activeValue}
    );

    return (
        <div className="toggle-button d-flex flex-row g-1">
            <button
                className={buttonClass(left)}
                onClick={() => handleToggle(left)}
            >{left}</button>
            <button
                className={buttonClass(right)}
                onClick={() => handleToggle(right)}
            >{right}</button>
        </div>
    );
};


export default ToggleButton;
