const Loader = ({ loading }: any) => {
  if (!loading) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 10,
      }}
    >
      Loading...
    </div>
  );
};

export default Loader;
