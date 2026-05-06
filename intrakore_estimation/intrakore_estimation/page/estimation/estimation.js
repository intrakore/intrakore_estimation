frappe.pages["estimation"].on_page_load = function (wrapper) {
	frappe.ui.make_app_page({
		parent: wrapper,
		title: __("estimation"),
		single_column: true,
	});
};

frappe.pages["estimation"].on_page_show = function (wrapper) {
	load_desk_page(wrapper);
};

function load_desk_page(wrapper) {
	let $parent = $(wrapper).find(".layout-main-section");
	$parent.empty();

	frappe.require("estimation.bundle.jsx").then(() => {
		frappe.estimation = new frappe.ui.Estimation({
			wrapper: $parent,
			page: wrapper.page,
		});
	});
}