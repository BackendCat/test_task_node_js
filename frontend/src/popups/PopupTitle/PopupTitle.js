import './PopupTitle.css'; // Импортируем CSS-файл


const PopupTitle = ({ text, is_error = false }) => {
    return (
        <span className={`bi bi-exclamation-circle ${is_error ? 'text-danger' : ''} popup-title`}>
            {text}
        </span>
    );
};


export default PopupTitle;