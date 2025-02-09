import { Button } from "react-bootstrap";
import "./FormButton.css";


const FormButton = ({text, onClick, subtext, ...otherProps}) => {
    return (
        <div className="d-flex flex-column align-items-center w-100 gap-1">
            <Button
                className="form-button w-100"
                variant="dark"
                type="submit"
                onClick={onClick}
                {...otherProps}
            >
                {text}
            </Button>
            <div className="text-muted text-center mt-0" style={{fontSize: 14}}>
                {subtext}
            </div>
        </div>

    );
};


export default FormButton;