import React, {FC, useEffect, useState} from 'react';
import { useSelector } from 'react-redux';
import { Form } from 'components/complex';
import './Login.scss';
import { FormikValues, useFormik } from 'formik';
import { object } from 'yup';
import { useNavigate } from 'react-router-dom';
import { commonSchema } from 'utils/validation';
import { loginFields } from 'components/pages/config';
import AuthService, { LoginFormData } from 'api/AuthAPI'
import { authYandex, login } from "slices/base";
import { clearMessage } from "slices/message";
import Loading from 'images/loading.svg';
import Oauth from 'images/yoauth.svg';
import { RootState, useAppDispatch } from 'store'

const {login: loginSchema, password: passwordSchema} = commonSchema;
const validationSchema = object().shape({
    login: loginSchema,
    password: passwordSchema,
});
// console.log(process.env)

const OAuthEl = () => {
    const [CLIENT_ID, setCLIENT_ID] = useState();
    const REDIRECT_URI = `${process.env.HOST}`;

    if(REDIRECT_URI !== undefined) {
        AuthService.authYandexServiceId(REDIRECT_URI).then(e => setCLIENT_ID(e.service_id));
    }

    return (
        <div className='login__oauth'>
            <a className='login__oauth-link' href={`https://oauth.yandex.ru/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`}>
                <img src={Oauth} alt='Oauth' />
            </a>
        </div>
    );
};

export const Login: FC = () => {
    const [loading, setLoading] = useState(false);
    const { message } = useSelector((state: RootState) => state.message);
    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    useEffect(() => {
        const code = window.location.search.replace('?code=', '');
        if(code) {
            // const data = new FormData();
            // data.append('code', code)
            // data.append('redirect_uri', `${process.env.HOST}`)

            dispatch(authYandex({
                code,
                redirect_uri: `${process.env.HOST}`
            }))
                .unwrap()
                .then(() => {
                    setTimeout(() => navigate('/'), 0);
                })
                .catch((e: Error) => {
                    console.error(e.message);
                });
        }
    }, []);

    useEffect(() => {
        dispatch(clearMessage());
    }, [dispatch]);

    const formik = useFormik<FormikValues>({
        initialValues: {
            login: '',
            password: '',
        },
        validationSchema,
        onSubmit: (data) => {
            setLoading(true);
            dispatch(login(data as LoginFormData))
                .unwrap()
                .then(() => {
                    setTimeout(() => navigate('/'), 1000);
                })
                .catch((e: Error) => {
                    console.error(e.message);
                    setLoading(false);
                });
        },
    });


    return (
        <div className='login__window'>
            <div className='login__container'>
                <div className='login__title'>
                    Авторизация
                </div>
                <Form
                    className='form-info'
                    fields={loginFields}
                    formik={formik}
                    buttonProps={{
                        children: message || (loading ? (
                            <span className='button-loading'>
                                <img src={Loading} alt='Loading' />
                            </span>
                        ) : 'Вход'),
                        type: 'submit',
                        disabled: !!loading,
                    }}
                    custom={OAuthEl}
                    altUrlProps={{
                        children: 'Ещё не зарегистрированы?',
                        onClick: () => navigate('/registration'),
                    }}
                />
            </div>
        </div>
    );
};
