import { Form } from "react-bootstrap";


const InputErrorAdvice = ({ value, validator = value => null }) => {
    const advice = validator(value);

    return (
        <Form.Text className="text-danger" style={{
            visibility: value && !advice ? 'hidden' : 'visible'
        }}>{
            (!value
                ? "Это поле не может быть пустым"
                : advice) || "placeholder"
        }</Form.Text>
    );
};


export default InputErrorAdvice;
