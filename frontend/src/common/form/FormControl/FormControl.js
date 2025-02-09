import { useState } from "react";
import { Dropdown, ListGroup, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import InputMask from "react-input-mask";
import InputErrorAdvice from "../../InputErrorAdvice";
import ElemToggler from "../../ElemToggler";
import {
    IoEyeOff as NotSeenEye,
    IoEye as SeenEye
} from "react-icons/io5";
import {
    IoInformationCircleOutline as NotSeenInfoIcon,
    IoInformationCircleSharp as SeenInfoIcon
} from "react-icons/io5";
import "./FormControl.css";


const FormControl = ({
                           label,
                           value,
                           onChange,
                           type = "text",
                           mask = "",
                           placeholder = "",
                           infoAdvice = null,
                           validator
                       }) => {
    const isPassword = type === "password";
    const [passwordSeen, setPasswordSeen] = useState(!isPassword);
    const [infoSeen, setInfoSeen] = useState(false);

    const controlSeen = () => {
        if (isPassword)
            return passwordSeen ? "text" : "password";
        return type;
    };

    const formControl = inputProps => (
        <Form.Control
            className="standard-input-group__control"
            {...inputProps}
            type={controlSeen()}
            placeholder={placeholder}
            autoComplete="on"
        />
    );

    const baseCln = "standard-input-group";
    const eyeCln = baseCln + "__eye";
    const infoCln = baseCln + "__info";
    const tooltipCln = infoCln + "__tooltip";
    const icon = "__icon";

    return (
        <Form.Group className={baseCln}>
            <Form.Label className={baseCln + "__label"}>{label}</Form.Label>

            {/*<div className={"standard-input-group__control-wrapper"}>*/}
            {mask
                ? <InputMask
                    class={baseCln + "__control"}
                    mask={mask}
                    maskChar=""
                    value={value}
                    onChange={onChange}>
                    {inputProps => formControl(inputProps)}
                </InputMask>
                : formControl({value, onChange})
            }
            {/*</div>*/}

            {isPassword && <ElemToggler
                className={eyeCln}
                first={<NotSeenEye className={eyeCln + icon}/>}
                second={<SeenEye className={eyeCln + icon}/>}
                onToggle={() => setPasswordSeen(val => !val)}
            />}

            {infoAdvice &&
                <OverlayTrigger
                    trigger="hover"
                    onToggle={() => setInfoSeen(!isPassword)}
                    placement="right"
                    overlay={
                        <Tooltip className={tooltipCln}>{
                            infoAdvice.map(advice =>
                                <div className={tooltipCln + "__item"}>{advice}</div>
                            )
                        }</Tooltip>
                    }
                >
                    <div className={infoCln}>
                        {infoSeen
                            ? <SeenInfoIcon className={infoCln + icon}/>
                            : <NotSeenInfoIcon className={infoCln + icon}/>}
                    </div>
                </OverlayTrigger>
            }

            <InputErrorAdvice validator={validator} value={value}/>
        </Form.Group>
    );
};


export default FormControl;
