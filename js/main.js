const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//Lấy các phần tử HTML
const addBtn = $(".add-btn");
const formAdd = $("#addTaskModal");
const modalClose = $(".modal-close");
const btnCancel = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");
const todoList = $("#todoList");
const searchInput = $(".search-input");

//Khi người dùng gõ vào ô tìm kiếm 
searchInput.oninput = function(event){
  console.log(event.target.value);
}

// Đây là biến để theo dõi đang sửa task nào
let editIndex = null;

//Hàm đóng form thêm/sửa task
function closeForm(){
  //Ẩn form
  formAdd.className = "modal-overlay";

  //Đổi lại tiêu đề form từ ban đầu
  const formTitle = formAdd.querySelector(".modal-title");
  if(formTitle) {
    formTitle.textContent = formTitle.dataset.original || formTitle.textContent;
    delete formTitle.dataset.original;
  }

  //Đổi lại submit về ban đầu 
  const submitBtn = formAdd.querySelector(".btn-submit");
  if (submitBtn) {
    submitBtn.textContent = submitBtn.dataset.original || submitBtn.textContent;
    delete submitBtn.dataset.original;
  };

  //Cuộn lại form lên đầu
  setTimeout(() => {
    formAdd.querySelector(".modal").scrollTop = 0;
  }, 300);

  //Xóa hết dữ liệu trong Form
  todoForm.reset();

  //Đặt lại trạng thái không sửa task nào
  editIndex = null;
}

//Hàm mở form thêm/sửa task
function openFormModal(){
  formAdd.className = ".modal-overlay show";
  setTimeout(() => titleInput.focus(), 100);
}

//Khi nhấn nút "Thêm mới"
addBtn.onclick = openFormModal;

//Khi nhấn nút đóng form
modalClose.onclick = closeForm;
btnCancel.onclick = closeForm;

//Lấy danh sách task từ trình duyệt nếu có 
const todoTasks = JSON.parse(localStorage.getItem("todoTask")) ?? [];

//Khi gửi form (thêm mới hoặc sửa task)
todoForm.onsubmit = (event) => {
  event.preventDefault();
  //Lấy dữ liệu từ form 
  const formData = Object.fromEntries(new FormData(todoForm));

  //Nếu đang sửa task
  if(editIndex) {
    todoTasks[editIndex] = formData;
  }

  //Nếu đang thêm task mới 
  else {
    formData.isCompleted = false;

    //Thêm task mới vào đầu danh sách
    todoTasks.unshift(formData);
  }

  //Lưu danh sách task vào bộ nhớ 
  saveTask();

  //Đóng form
  closeForm();

  //Hiển thị lại danh sách task
  renderTasks();
};

//Hàm lưu danh sách task vào bộ nhớ trình duyệt
function saveTask(){
  localStorage.setItem("todoTask", JSON.stringify(todoTasks));
};

// Xử lý khi nhấn các nút trong danh sách task
todoList.onclick = function (event) {
  const editBtn = event.target.closest(".edit-btn");
  const deleteBtn = event.target.closest(".delete-btn");
  const completeBtn = event.target.closest(".complete-btn");

  //Nếu nhấn nút sửa
  if(editBtn){
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];

    //Đánh dấu đang sửa task này 
    editBtn = taskIndex;

    //Điền thông tin vào form
    for( const key in task){
      const value = task[key];
      const input = $(`[name="${key}"]`);
      if(input){
        input.value = value;
      }
    }

    //Đổi tiêu đề form thành edit task
    const formTitle = formAdd.querySelector(".modal-title");
    if(formTitle){
      formTitle.dataset.original = formTitle.textContent;
      formTitle.textContent = "Edit Task";
    }

    //Đổi text nút submit thành "Save task"
    const submitBtn = formAdd.querySelector(".btn-submit");
    if(submitBtn){
      submitBtn.dataset.original = formTitle.textContent;
      formTitle.textContent = "Save Task";
    }

    //Mở form
    openFormModal();
  }

  //Nếu nhấn nút xóa
  if(deleteBtn){
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];

    //Hỏi trước khi nhấn xóa
    if(confirm(` Bạn có chắc chắn muốn xóa công việc không "${task.index}"`)){
      //Xóa task khỏi danh sách
      todoTasks.splice(taskIndex, 1);

      //Lưu và hiển thị lại
      saveTask();
      renderTasks();
    }
  }

  //Nếu nhấn nút hoàn thành/chưa hoàn thành
  if(completeBtn){
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];

    //Đổi trạng thái hoàn thành
    task.isCompleted = !task.isCompleted;

    //Lưu và hiển thị lại
    saveTask();
    renderTasks();
  }
};

// Hàm hiển thị danh sách task ra màn hình
function renderTasks() {
  // Nếu chưa có task nào
  if (!todoTasks.length) {
      todoList.innerHTML = `
          <p>Chưa có công việc nào.</p>
      `;
      return;
  }

  // Tạo HTML cho từng task
  const html = todoTasks
      .map(
          (task, index) => `
      <div class="task-card ${task.color} ${
              task.isCompleted ? "completed" : ""
          }">
      <div class="task-header">
        <h3 class="task-title">${task.title}</h3>
        <button class="task-menu">
          <i class="fa-solid fa-ellipsis fa-icon"></i>
          <div class="dropdown-menu">
            <div class="dropdown-item edit-btn" data-index="${index}">
              <i class="fa-solid fa-pen-to-square fa-icon"></i>
              Edit
            </div>
            <div class="dropdown-item complete-btn" data-index="${index}">
              <i class="fa-solid fa-check fa-icon"></i>
              ${task.isCompleted ? "Mark as Active" : "Mark as Complete"} 
            </div>
            <div class="dropdown-item delete delete-btn" data-index="${index}">
              <i class="fa-solid fa-trash fa-icon"></i>
              Delete
            </div>
          </div>
        </button>
      </div>
      <p class="task-description">${task.description}</p>
      <div class="task-time">${task.startTime} - ${task.endTime}</div>
    </div>
  `
      )
      .join("");

  // Hiển thị HTML ra màn hình
  todoList.innerHTML = html;
}

// Hiển thị danh sách task khi trang web tải xong
renderTasks();