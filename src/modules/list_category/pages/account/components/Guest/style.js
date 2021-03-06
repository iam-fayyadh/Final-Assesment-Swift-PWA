import makeStyles from '@material-ui/core/styles/makeStyles';
import { FlexColumn, CreatePadding, Centering } from '@theme_mixins';

export default makeStyles({
    root: {
        width: '100%',
        height: '100%',
        ...FlexColumn,
        alignItems: 'center',
    },
    authBlock: {
        ...Centering,
        width: '100%',
        height: '120vh',
        ...CreatePadding(50, 30, 15, 30),
        textAlign: 'center',
    },
    btnSigin: {
        marginBottom: 35,
        marginTop: 15,
    },

    formSubs: {
        padding: 30,
        display: 'inline',
        width: '50%',
    },
    textList: {
        padding: 40,
        backgroundColor: 'black',
    },

    typo: {
        fontWeight: 900,
        fontStyle: 'italic',
        fontSize: 16,
    },
});
