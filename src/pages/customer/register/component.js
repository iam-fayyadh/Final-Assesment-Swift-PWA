import Button from '@components/Button';
import PasswordField from '@components/Forms/Password';
import TextField from '@components/Forms/TextField';
import Typography from '@components/Typography';
import { regexPhone } from '@helpers/regex';
import { Checkbox, FormControlLabel } from '@material-ui/core/';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Router from 'next/router';
import Toast from '@components/Toast';
import Backdrop from '@components/Loaders/Backdrop';
import OtpBlock from '@components/OtpBlock';
import { setLogin } from '@helpers/auth';
import { setCartId, getCartId } from '@helpers/cartId';
import { GraphCart, GraphConfig } from '@services/graphql';
import { expiredToken, custDataNameCookie } from '@config';
import Cookies from 'js-cookie';
import { getCustomer } from '@services/graphql/schema/customer';
import { useQuery } from '@apollo/react-hooks';
import { register } from './services/graphql';
import useStyles from './style';

const Register = ({ t, storeConfig }) => {
    const styles = useStyles();
    const [phoneIsWa, setPhoneIsWa] = React.useState(false);
    const [message, setMessage] = React.useState({
        open: false,
        variant: 'success',
        text: '',
    });
    const [cusIsLogin, setIsLogin] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    let cartId = '';

    const expired = storeConfig.oauth_access_token_lifetime_customer
        ? new Date(Date.now() + parseInt(storeConfig.oauth_access_token_lifetime_customer, 10) * 3600000) : expiredToken;

    if (typeof window !== 'undefined') {
        cartId = getCartId();
    }

    const [getCart, cartData] = GraphCart.getCustomerCartId();
    const [mergeCart, { called }] = GraphCart.mergeCart();
    const custData = useQuery(getCustomer, {
        context: {
            request: 'internal',
        },
        skip: !cusIsLogin,
    });
    const otpConfig = GraphConfig.otpConfig();

    const [sendRegister] = register();

    const handleWa = async () => {
        if (phoneIsWa === false) {
            // eslint-disable-next-line no-use-before-define
            formik.setFieldValue('whatsappNumber', formik.values.phoneNumber);
        }
        setPhoneIsWa(!phoneIsWa);
    };

    const RegisterSchema = Yup.object().shape({
        email: Yup.string().email(t('validate:email:wrong')).required(t('validate:email:required')),
        firstName: Yup.string().required(t('validate:firstName:required')),
        lastName: Yup.string().required(t('validate:lastName:required')),
        password: Yup.string().required(t('validate:password:required')),
        confirmPassword: Yup.string()
            .required(t('validate:confirmPassword:required'))
            // eslint-disable-next-line no-use-before-define
            .test('check-pass', t('validate:confirmPassword.wrong'), (input) => input === formik.values.password),
        phoneNumber: Yup.string().required(t('validate:phoneNumber:required')).matches(regexPhone, t('validate:phoneNumber:wrong')),
        whatsappNumber: Yup.string().required(t('validate:whatsappNumber:required')).matches(regexPhone, t('validate:whatsappNumber:wrong')),
        otp: otpConfig.data && otpConfig.data.otpConfig.otp_enable[0].enable_otp_register && Yup.number().required('Otp is required'),
    });

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            phoneNumber: '',
            whatsappNumber: '',
            subscribe: false,
            otp: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: (values) => {
            setLoading(true);
            sendRegister({
                variables: values,
            })
                .then(async () => {
                    await setIsLogin(1);
                    getCart();
                    setLoading(false);
                })
                .catch((e) => {
                    setLoading(false);
                    setMessage({
                        open: true,
                        text: e.message.split(':')[1] || t('customer:register:failed'),
                        variant: 'error',
                    });
                });
        },
    });

    if (cartData.data && custData.data) {
        Cookies.set(custDataNameCookie, {
            email: custData.data.customer.email,
        });
        const custCartId = cartData.data.customerCart.id;
        if (cartId === '' || !cartId) {
            setLogin(1, expired);
            setCartId(custCartId, expired);
            setMessage({
                open: true,
                text: t('customer:register:success'),
                variant: 'success',
            });
            Router.push('/customer/account');
        } else if (!called && (cartId !== custCartId)) {
            mergeCart({
                variables: {
                    sourceCartId: cartId,
                    destionationCartId: custCartId,
                },
            })
                .then(() => {
                    setLogin(1, expired);
                    setCartId(custCartId, expired);
                    setMessage({
                        open: true,
                        text: t('customer:register:success'),
                        variant: 'success',
                    });
                    Router.push('/customer/account');
                })
                .catch((e) => {
                    setLoading(false);
                    setMessage({
                        open: true,
                        text: e.message.split(':')[1] || t('customer:register:failed'),
                        variant: 'error',
                    });
                    console.log(e);
                });
        } else {
            Router.push('/customer/account');
        }
    }

    return (
        <>
            <Backdrop open={loading} />
            <Toast open={message.open} message={message.text} variant={message.variant} setOpen={() => setMessage({ ...message, open: false })} />
            <form className={styles.container} onSubmit={formik.handleSubmit}>
                <TextField
                    label={t('common:form:firstName')}
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.firstName && formik.errors.firstName)}
                    errorMessage={(formik.touched.firstName && formik.errors.firstName) || null}
                />
                <TextField
                    label={t('common:form:lastName')}
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.lastName && formik.errors.lastName)}
                    errorMessage={(formik.touched.lastName && formik.errors.lastName) || null}
                />
                <TextField
                    label="Email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.email && formik.errors.email)}
                    errorMessage={(formik.touched.email && formik.errors.email) || null}
                />
                <PasswordField
                    label="Password"
                    showVisible
                    showPasswordMeter
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.password && formik.errors.password)}
                    errorMessage={(formik.touched.password && formik.errors.password) || null}
                />
                <TextField
                    label={t('common:form:confirm')}
                    type="password"
                    name="confirmPassword"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={!!(formik.touched.confirmPassword && formik.errors.confirmPassword)}
                    errorMessage={(formik.touched.confirmPassword && formik.errors.confirmPassword) || null}
                />
                {otpConfig.data && otpConfig.data.otpConfig.otp_enable[0].enable_otp_register ? (
                    <OtpBlock
                        type="register"
                        phoneProps={{
                            name: 'phoneNumber',
                            value: formik.values.phoneNumber,
                            onChange: formik.handleChange,
                            error: !!(formik.errors.phoneNumber && formik.touched.phoneNumber),
                            errorMessage: (formik.touched.phoneNumber && formik.errors.phoneNumber) || null,
                        }}
                        codeProps={{
                            name: 'otp',
                            value: formik.values.otp,
                            onChange: formik.handleChange,
                            error: !!(formik.touched.otp && formik.errors.otp),
                            errorMessage: (formik.touched.otp && formik.errors.otp) || null,
                            footer: (
                                <FormControlLabel
                                    onChange={handleWa}
                                    className={styles.checkWa}
                                    control={<Checkbox name="whastapptrue" color="primary" size="small" />}
                                    label={<Typography variant="p">{t('customer:register:isWhatsapp')}</Typography>}
                                />
                            ),
                        }}
                    />
                ) : (
                    <TextField
                        label={t('common:form:phoneNumber')}
                        name="phoneNumber"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        error={!!(formik.touched.phoneNumber && formik.errors.phoneNumber)}
                        errorMessage={(formik.touched.phoneNumber && formik.errors.phoneNumber) || null}
                        footer={(
                            <FormControlLabel
                                onChange={handleWa}
                                className={styles.checkWa}
                                control={<Checkbox name="whastapptrue" color="primary" size="small" />}
                                label={<Typography variant="p">{t('customer:register:isWhatsapp')}</Typography>}
                            />
                        )}
                    />
                )}
                {!phoneIsWa && (
                    <TextField
                        label={`${t('customer:form:phoneNumber')} Whatsapp`}
                        name="whatsappNumber"
                        value={formik.values.whatsappNumber}
                        onChange={formik.handleChange}
                        error={!!(formik.touched.whatsappNumber && formik.errors.whatsappNumber)}
                        errorMessage={(formik.touched.whatsappNumber && formik.errors.whatsappNumber) || null}
                    />
                )}
                <div className={styles.footer}>
                    <FormControlLabel
                        value={formik.values.subscribe}
                        onChange={formik.handleChange}
                        name="subscribe"
                        control={<Checkbox name="subscribe" color="primary" size="small" />}
                        label={(
                            <Typography variant="p" letter="capitalize" className="row center">
                                {t('customer:register:subscribe')}
                            </Typography>
                        )}
                    />
                    <Button disabled={loading} fullWidth className={styles.btnSigin} type="submit">
                        <Typography variant="title" type="regular" letter="capitalize" color="white">
                            {t('customer:register:button')}
                        </Typography>
                    </Button>
                </div>
            </form>
        </>
    );
};

export default Register;
