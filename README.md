Cách đặt tên

- Thư mục thì đặt tên viết thường cách nhau bởi dấu gạch dưới (customer, customer_detail)
- Tên file đặt theo kiểu lạc đà viết hoa chữ đầu (CustomerInfo)
- Tên screen kết thúc bằng chữ "Screen" (HomeScreen)
- Tên hàm không viết gạch dưới , tên rõ nghĩa
- Thứ tự các hàm trong component
  class Demo extends React.Component {
  constructor(props) {}
  componentDidMount(){}
  componentWillUnmount(){}
  // các hàm handle
  // các hàm dùng cho render
  render(){}
  }

Style

- Global thì có file style bên ngoài
- Trong từng thư mục con của screen có thể tạo thêm các style giống với tên screen hoặc component
