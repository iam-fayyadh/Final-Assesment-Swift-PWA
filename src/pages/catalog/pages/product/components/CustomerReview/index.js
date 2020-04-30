/* eslint-disable camelcase */
import Typography from '@components/Typography';
import moment from 'moment';
import Avatar from 'react-avatar';
import useStyles from './style';
import RatingStar from '../RatingStar';

const CustomerReview = (props) => {
    const styles = useStyles();
    const {
        nickname, created_at, detail, ratings,
    } = props;
    const date = created_at || Date.now();
    const valueRate = ratings && ratings.length > 0 && ratings[0].value ? ratings[0].value : 0;
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.customerContainer}>
                    <div className={styles.imgContainer}>
                        <Avatar
                            name={nickname || 'A'}
                            className={styles.imgContainer}
                            size={43}
                            round
                        />
                    </div>
                    <div className={styles.customerProfile}>
                        <Typography
                            variant="span"
                            type="bold"
                            letter="uppercase"
                            className="clear-margin-padding"
                        >
                            {nickname || 'Anonymouse' }
                        </Typography>
                        <Typography
                            type="regular"
                            variant="p"
                            letter="capitalize"
                            className="clear-margin-padding"
                        >
                            {moment(date).format('DD/M/YYYY')}
                        </Typography>
                    </div>
                </div>

                <div>
                    <RatingStar value={valueRate} />
                </div>
            </div>
            <div className={styles.content}>
                <Typography variant="p" type="regular" align="left">
                    { detail || '-' }
                </Typography>
            </div>
        </div>
    );
};

export default CustomerReview;