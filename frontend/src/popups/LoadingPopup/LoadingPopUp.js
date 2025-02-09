import { Container, Modal, Spinner } from 'react-bootstrap';
import PopupTitle from "../PopupTitle/PopupTitle";
import './LoadingPopUp.css';


const LoadingPopUp = ({ show, error, message, onClose }) => {
    return (
        <Modal show={show} centered onHide={onClose} className="loading-popup">
            <Modal.Body className="loading-popup__body">
                <Container className="loading-popup__wrapper">
                    {error ?
                        <PopupTitle text="Error" is_error={true}/> :
                        <Spinner
                            animation="border"
                            role="status"
                            className="loading-popup__spinner"
                        />
                    }
                </Container>
                <div>
                    {error ? "Произошла ошибка: " : ""}
                    {error || message}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LoadingPopUp;
