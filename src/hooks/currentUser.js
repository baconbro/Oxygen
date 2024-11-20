import { get } from 'lodash';



const useCurrentUser = ({ cachePolicy = 'cache-only' } = {}) => {
  //const [{ data }] = useApi.get('/currentUser', {}, { cachePolicy });

  return {
    currentUser: {
      email: 'gaben@oxgn.test',
      name: 'Gaben',
      avatarUrl: 'https://i.ibb.co/6RJ5hq6/gaben.jpg',
      id:8908,
  },//get(data, 'currentUser'),
    currentUserId: 8908, //get(data, 'currentUser.id'),
  };
};

export default useCurrentUser;
