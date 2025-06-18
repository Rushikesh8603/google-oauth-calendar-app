const Home = ({ onLogin }) => {
  return (
    <div className="h-screen flex items-center justify-center flex-col bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">📅 Welcome to Calendar App</h1>
      <button
        onClick={onLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg"
      >
        Login with Google
      </button>
    </div>
  );
};

export default Home;
