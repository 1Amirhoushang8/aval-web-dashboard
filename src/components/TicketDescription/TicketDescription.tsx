
import "./TicketDescription.scss";

import type {DescriptionInputProps} from "../../models/TicketDescriptionInterface/TicketDescriptionInterface.ts"

export default function TicketDescription({
                                             value,
                                             onChange,
                                             disabled = false,
                                             placeholder = "توضیحات کامل مشکل را وارد کنید"
                                         }: DescriptionInputProps) {
    return (
        <div className="field textarea">
            <label>توضیحات</label>
            <textarea
                rows={4}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={disabled ? 'disabled' : ''}
            />
            <div className="char-count">
                {value.length} / ۱۰۰۰
            </div>
        </div>
    );
}